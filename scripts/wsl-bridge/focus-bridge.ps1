<#
.SYNOPSIS
    Toolbox WSL2 Focus Bridge
    Registra o atalho global Ctrl + Space no Windows e envia o sinal de ativação para o Toolbox rodando no WSL2.

.DESCRIPTION
    Quando o Toolbox é executado sob WSL2/WSLg, as teclas de atalho globais registradas pelo Wayland/X11
    não recebem eventos quando o foco está em janelas nativas do Windows host.
    Este script registra o atalho global no Windows e comunica-se com a porta IPC local (49152)
    do daemon do Toolbox no WSL2 para focar e exibir a janela instantaneamente.
    Possui suporte a rede NAT (fallback para IP dinâmico do WSL), instância única via Mutex
    e encerramento gracioso com verificação de heartbeat.
#>

# 1. Controle de Instância Única via Mutex do Windows
$createdNew = $false
$mutex = New-Object System.Threading.Mutex($true, "Global\ToolboxWslFocusBridgeMutex", [ref]$createdNew)
if (-not $createdNew) {
    # Já existe outra instância do Focus Bridge em execução no Windows host
    exit 0
}

Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
using System.Windows.Forms;

public class GlobalHotkey : Form {
    [DllImport("user32.dll")]
    public static extern bool RegisterHotKey(IntPtr hWnd, int id, int fsModifiers, int vlc);

    [DllImport("user32.dll")]
    public static extern bool UnregisterHotKey(IntPtr hWnd, int id);

    public const int MOD_CONTROL = 0x0002;
    public const int VK_SPACE = 0x20;
    public const int WM_HOTKEY = 0x0312;
    public const int HOTKEY_ID = 9001;

    public Action OnHotkeyPressed;

    public GlobalHotkey(Action action) {
        this.OnHotkeyPressed = action;
        RegisterHotKey(this.Handle, HOTKEY_ID, MOD_CONTROL, VK_SPACE);
    }

    protected override void WndProc(ref Message m) {
        if (m.Msg == WM_HOTKEY && m.WParam.ToInt32() == HOTKEY_ID) {
            OnHotkeyPressed?.Invoke();
        }
        base.WndProc(ref m);
    }

    protected override void Dispose(bool disposing) {
        UnregisterHotKey(this.Handle, HOTKEY_ID);
        base.Dispose(disposing);
    }
}
"@ -ReferencedAssemblies "System.Windows.Forms", "System.Drawing"

function Send-ToolboxFocusSignal {
    param(
        [string]$Message = "show_and_focus",
        [int]$Port = 49152
    )

    $connected = $false

    # 1. Tentar loopback 127.0.0.1 (WSL2 com localhostForwarding=true ou networkingMode=mirrored)
    try {
        $client = New-Object System.Net.Sockets.TcpClient
        $iar = $client.BeginConnect("127.0.0.1", $Port, $null, $null)
        if ($iar.AsyncWaitHandle.WaitOne(300, $false)) {
            $client.EndConnect($iar)
            $stream = $client.GetStream()
            $writer = New-Object System.IO.StreamWriter($stream)
            $writer.WriteLine($Message)
            $writer.Flush()
            $client.Close()
            $connected = $true
        } else {
            $client.Close()
        }
    } catch {
        # Loopback indisponível, tenta fallback para a interface da VM
    }

    # 2. Se falhar, obter IP da interface WSL e conectar diretamente na VM (modo NAT)
    if (-not $connected) {
        try {
            $wslOutput = wsl.exe -e hostname -I 2>$null
            if ($wslOutput) {
                $wslIp = $wslOutput.Trim().Split(' ')[0]
                if ($wslIp -and $wslIp -ne "127.0.0.1") {
                    $client = New-Object System.Net.Sockets.TcpClient
                    $iar = $client.BeginConnect($wslIp, $Port, $null, $null)
                    if ($iar.AsyncWaitHandle.WaitOne(500, $false)) {
                        $client.EndConnect($iar)
                        $stream = $client.GetStream()
                        $writer = New-Object System.IO.StreamWriter($stream)
                        $writer.WriteLine($Message)
                        $writer.Flush()
                        $client.Close()
                        $connected = $true
                    } else {
                        $client.Close()
                    }
                }
            }
        } catch {
            # O Toolbox ou WSL pode não estar em execução
        }
    }

    return $connected
}

Write-Host "Iniciando Toolbox WSL2 Focus Bridge (Ctrl + Space)..." -ForegroundColor Cyan
Write-Host "Pressione Ctrl+C para encerrar." -ForegroundColor Yellow

$hotkeyForm = New-Object GlobalHotkey -ArgumentList {
    [void](Send-ToolboxFocusSignal -Message "show_and_focus")
}

# Timer de Heartbeat para auto-encerramento quando o Toolbox não estiver em execução
$global:consecutiveFailures = 0
$global:maxConsecutiveFailures = 18  # 18 x 10s = 3 minutos sem Toolbox ativo

$heartbeatTimer = New-Object System.Windows.Forms.Timer
$heartbeatTimer.Interval = 10000 # a cada 10 segundos
$heartbeatTimer.Add_Tick({
    $alive = Send-ToolboxFocusSignal -Message "ping"
    if ($alive) {
        $global:consecutiveFailures = 0
    } else {
        $global:consecutiveFailures++
        if ($global:consecutiveFailures -ge $global:maxConsecutiveFailures) {
            $heartbeatTimer.Stop()
            [System.Windows.Forms.Application]::Exit()
        }
    }
})
$heartbeatTimer.Start()

try {
    [System.Windows.Forms.Application]::Run($hotkeyForm)
} finally {
    try {
        $mutex.ReleaseMutex()
        $mutex.Dispose()
    } catch {}
}

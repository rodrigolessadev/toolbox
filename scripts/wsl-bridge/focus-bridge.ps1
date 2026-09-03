<#
.SYNOPSIS
    Toolbox WSL2 Focus Bridge
    Registra o atalho global Ctrl + Space no Windows e envia o sinal de ativação para o Toolbox rodando no WSL2.

.DESCRIPTION
    Quando o Toolbox é executado sob WSL2/WSLg, as teclas de atalho globais registradas pelo Wayland/X11
    não recebem eventos quando o foco está em janelas nativas do Windows host.
    Este script registra o atalho global no Windows e comunica-se com a porta IPC local (127.0.0.1:49152)
    do daemon do Toolbox no WSL2 para focar e exibir a janela instantaneamente.
#>

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
        [string]$HostAddress = "127.0.0.1",
        [int]$Port = 49152
    )

    try {
        $client = New-Object System.Net.Sockets.TcpClient
        $client.Connect($HostAddress, $Port)
        $stream = $client.GetStream()
        $writer = New-Object System.IO.StreamWriter($stream)
        $writer.WriteLine("show_and_focus")
        $writer.Flush()
        $client.Close()
    } catch {
        # O Toolbox pode não estar aberto ou a porta não estar escutando
    }
}

Write-Host "Iniciando Toolbox WSL2 Focus Bridge (Ctrl + Space)..." -ForegroundColor Cyan
Write-Host "Pressione Ctrl+C para encerrar." -ForegroundColor Yellow

$hotkeyForm = New-Object GlobalHotkey -ArgumentList {
    Send-ToolboxFocusSignal
}

[System.Windows.Forms.Application]::Run($hotkeyForm)

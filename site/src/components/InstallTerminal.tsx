import { useState } from 'react';

export default function InstallTerminal() {
  const [activeTab, setActiveTab] = useState<'curl' | 'dpkg'>('curl');
  const [copied, setCopied] = useState(false);

  const curlCmd = 'curl -fsSL https://toolbox.rodrigolessa.dev/install.sh | bash';
  const dpkgCmd = 'sudo dpkg -i toolbox_*_amd64.deb';

  const currentCmd = activeTab === 'curl' ? curlCmd : dpkgCmd;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentCmd);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  return (
    <div className="terminal-card">
      <div className="terminal-header">
        <div className="terminal-dots">
          <span className="dot dot-red"></span>
          <span className="dot dot-yellow"></span>
          <span className="dot dot-green"></span>
        </div>
        <div className="terminal-tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'curl' ? 'active' : ''}`}
            onClick={() => setActiveTab('curl')}
          >
            🐧 Linux / WSL2 (One-Liner)
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'dpkg' ? 'active' : ''}`}
            onClick={() => setActiveTab('dpkg')}
          >
            📦 Pacote .deb Manual
          </button>
        </div>
        <button
          type="button"
          className="copy-btn"
          onClick={handleCopy}
          title="Copiar comando"
        >
          {copied ? '✔ Copiado!' : '📋 Copiar'}
        </button>
      </div>

      <div className="terminal-body">
        <span className="prompt">$</span>
        <code className="command-text">{currentCmd}</code>
      </div>

      <style>{`
        .terminal-card {
          margin: 32px 0;
          background: #0d1117;
          border: 1px solid #30363d;
          border-radius: 10px;
          overflow: hidden;
          font-family: var(--font-mono, monospace);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }
        .terminal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 14px;
          background: #161b22;
          border-bottom: 1px solid #30363d;
        }
        .terminal-dots {
          display: flex;
          gap: 6px;
        }
        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .dot-red { background: #ff5f56; }
        .dot-yellow { background: #ffbd2e; }
        .dot-green { background: #27c93f; }
        .terminal-tabs {
          display: flex;
          gap: 6px;
        }
        .tab-btn {
          background: transparent;
          border: none;
          color: #8b949e;
          font-size: 13px;
          padding: 4px 10px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .tab-btn:hover {
          color: #c9d1d9;
          background: rgba(255, 255, 255, 0.05);
        }
        .tab-btn.active {
          color: #58a6ff;
          background: rgba(88, 166, 255, 0.12);
          font-weight: 500;
        }
        .copy-btn {
          background: #21262d;
          color: #c9d1d9;
          border: 1px solid #363b42;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .copy-btn:hover {
          background: #30363d;
          border-color: #58a6ff;
          color: #fff;
        }
        .terminal-body {
          padding: 16px 18px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #f0f6fc;
          font-size: 14px;
          overflow-x: auto;
        }
        .prompt {
          color: #7ee787;
          user-select: none;
          font-weight: bold;
        }
        .command-text {
          color: #e6edf3;
        }
      `}</style>
    </div>
  );
}

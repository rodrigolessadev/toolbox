import { useEffect, useState } from 'react';
import { formatBytes, formatDate, type LatestReleaseResponse } from '../lib/github';

type State =
  | { status: 'loading' }
  | { status: 'ready'; data: LatestReleaseResponse }
  | { status: 'error'; message: string }
  | { status: 'empty' };

export default function DownloadButton() {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch('/api/latest');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (cancelled) return;
        if (json && json.tag) {
          setState({ status: 'ready', data: json as LatestReleaseResponse });
        } else {
          setState({ status: 'empty' });
        }
      } catch (err) {
        if (cancelled) return;
        setState({
          status: 'error',
          message: err instanceof Error ? err.message : 'Falha ao buscar release',
        });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === 'loading') {
    return (
      <div className="download-cta">
        <div className="download-dual-group">
          <div className="download-platform-box is-recommended">
            <div className="platform-pill-badge">
              <span className="platform-os-tag">🪟 Windows</span>
              <span className="badge-rec">Oficial</span>
            </div>
            <div className="platform-btn-row">
              <a className="btn btn-primary download-btn-main" href="/download">
                <span aria-hidden>⬇</span>
                <span>Baixar (.exe)</span>
              </a>
              <a className="btn-ghost-subtle" href="/download" title="Baixar pacote corporativo .msi">
                .msi
              </a>
            </div>
          </div>
          <div className="download-platform-box is-recommended">
            <div className="platform-pill-badge">
              <span className="platform-os-tag">🐧 Linux</span>
              <span className="badge-rec">Oficial</span>
            </div>
            <div className="platform-btn-row">
              <a className="btn btn-primary download-btn-main" href="/download">
                <span aria-hidden>⬇</span>
                <span>Baixar (.AppImage)</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <a className="btn btn-secondary btn-large" href="/download">
        Ver versões disponíveis
      </a>
    );
  }

  if (state.status === 'empty' || (!state.data.windows_installer && !state.data.linux_deb && !state.data.linux_appimage && !state.data.installer)) {
    return (
      <div className="download-cta">
        <a className="btn btn-secondary btn-large" href="/download">
          Ver versões disponíveis
        </a>
      </div>
    );
  }

  const { tag, published_at, installer, windows_installer, windows_msi, linux_deb, linux_appimage } = state.data;

  const [isLinux, setIsLinux] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.navigator) {
      const ua = window.navigator.userAgent.toLowerCase();
      setIsLinux(ua.indexOf('linux') >= 0 || ua.indexOf('x11') >= 0);
    }
  }, []);

  const winPrimary = windows_installer || installer;
  const linuxPrimary = linux_appimage || linux_deb || installer;

  return (
    <div className="download-cta">
      <div className="download-dual-group">
        {/* Painel de Download Windows */}
        <div className="download-platform-box is-recommended">
          <div className="platform-pill-badge">
            <span className="platform-os-tag">🪟 Windows</span>
            <span className="badge-rec">{!isLinux ? '★ Recomendado' : 'Oficial'}</span>
          </div>
          <div className="platform-btn-row">
            <a
              className="btn btn-primary download-btn-main"
              href={winPrimary ? winPrimary.browser_download_url : '/download'}
              rel="noopener noreferrer"
              title="Baixar instalador oficial para Windows (.exe)"
            >
              <span aria-hidden>⬇</span>
              <span>Baixar (.exe)</span>
            </a>
            {windows_msi && (
              <a
                className="btn-ghost-subtle"
                href={windows_msi.browser_download_url}
                title={`Baixar pacote corporativo .msi (${formatBytes(windows_msi.size)})`}
              >
                .msi
              </a>
            )}
          </div>
        </div>

        {/* Painel de Download Linux */}
        <div className="download-platform-box is-recommended">
          <div className="platform-pill-badge">
            <span className="platform-os-tag">🐧 Linux</span>
            <span className="badge-rec">{isLinux ? '★ Recomendado' : 'Oficial'}</span>
          </div>
          <div className="platform-btn-row">
            <a
              className="btn btn-primary download-btn-main"
              href={linuxPrimary ? linuxPrimary.browser_download_url : '/download'}
              rel="noopener noreferrer"
              title="Baixar pacote oficial para Linux"
            >
              <span aria-hidden>⬇</span>
              <span>Baixar ({linux_appimage ? '.AppImage' : '.deb'})</span>
            </a>
            {linux_deb && linux_appimage && (
              <a
                className="btn-ghost-subtle"
                href={linux_deb.browser_download_url}
                title={`Baixar pacote de sistema .deb (${formatBytes(linux_deb.size)})`}
              >
                .deb
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="download-meta">
        <span className="tag">{tag}</span>
        <span className="muted">· Windows &amp; Linux sincronizados</span>
        <span className="muted">· {formatDate(published_at)}</span>
        <a href="/download" className="meta-all-link" title="Ver checksums e histórico de todas as versões">
          Todas as versões →
        </a>
      </div>
    </div>
  );
}

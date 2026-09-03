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
      <a className="btn btn-primary btn-large" href="#" aria-disabled="true">
        <span>⏳</span> Carregando versão…
      </a>
    );
  }

  if (state.status === 'error') {
    return (
      <a className="btn btn-secondary btn-large" href="/download">
        Ver versões disponíveis
      </a>
    );
  }

  if (state.status === 'empty' || !state.data.installer) {
    return (
      <a className="btn btn-secondary btn-large" href="/download">
        Em breve
      </a>
    );
  }

  const { tag, published_at, installer, windows_installer, linux_deb, linux_appimage } = state.data;

  const [isLinux, setIsLinux] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.navigator) {
      const ua = window.navigator.userAgent.toLowerCase();
      setIsLinux(ua.indexOf('linux') >= 0 || ua.indexOf('x11') >= 0);
    }
  }, []);

  const primaryAsset = isLinux
    ? (linux_deb || linux_appimage || installer)
    : (windows_installer || installer);

  const primaryLabel = isLinux
    ? (linux_deb ? 'Baixar para Linux (.deb)' : (linux_appimage ? 'Baixar para Linux (.AppImage)' : 'Baixar para Linux'))
    : 'Baixar para Windows (.exe)';

  if (!primaryAsset) {
    return (
      <a className="btn btn-secondary btn-large" href="/download">
        Ver versões disponíveis
      </a>
    );
  }

  return (
    <div className="download-cta">
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <a
          className="btn btn-primary btn-large"
          href={primaryAsset.browser_download_url}
          rel="noopener noreferrer"
        >
          <span aria-hidden>⬇</span>
          {primaryLabel}
        </a>

        {isLinux && windows_installer && (
          <a
            className="btn btn-secondary"
            href={windows_installer.browser_download_url}
            title="Baixar versão para Windows"
          >
            Versão Windows (.exe)
          </a>
        )}

        {!isLinux && (linux_deb || linux_appimage) && (
          <a
            className="btn btn-secondary"
            href={linux_deb?.browser_download_url || linux_appimage?.browser_download_url}
            title="Baixar versão para Linux"
          >
            Versão Linux ({linux_deb ? '.deb' : '.AppImage'})
          </a>
        )}
      </div>

      <div className="download-meta">
        <span className="tag">{tag}</span>
        <span className="muted">· {formatBytes(primaryAsset.size)}</span>
        <span className="muted">· {formatDate(published_at)}</span>
      </div>
    </div>
  );
}

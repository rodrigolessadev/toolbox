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

  const { installer, tag, size_mb, published_at } = state.data;

  return (
    <div className="download-cta">
      <a
        className="btn btn-primary btn-large"
        href={installer.browser_download_url}
        rel="noopener noreferrer"
      >
        <span aria-hidden>⬇</span>
        Baixar para Windows
      </a>
      <div className="download-meta">
        <span className="tag">{tag}</span>
        <span className="muted">· {formatBytes(installer.size)}</span>
        <span className="muted">· {formatDate(published_at)}</span>
      </div>
    </div>
  );
}

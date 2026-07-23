/**
 * Helpers para consumir a API do GitHub Releases.
 * Usado pelos endpoints serverless e pelo cliente.
 */

const GITHUB_API = 'https://api.github.com';

export interface ReleaseAsset {
  name: string;
  browser_download_url: string;
  size: number;
  content_type: string;
}

export interface Release {
  tag_name: string;
  name: string;
  body: string;
  html_url: string;
  published_at: string;
  prerelease: boolean;
  draft: boolean;
  assets: ReleaseAsset[];
}

export interface LatestReleaseResponse {
  tag: string;
  name: string;
  published_at: string;
  html_url: string;
  body: string;
  installer: ReleaseAsset | null;
  size_mb: number;
  all_assets: ReleaseAsset[];
}

function getRepo(): string {
  // Em produção, defina PUBLIC_GITHUB_REPO no painel da Vercel.
  const repo = import.meta.env.PUBLIC_GITHUB_REPO || 'seu-usuario/toolbox';
  return repo;
}

export async function fetchLatestRelease(): Promise<LatestReleaseResponse | null> {
  const repo = getRepo();
  const res = await fetch(`${GITHUB_API}/repos/${repo}/releases/latest`, {
    headers: { Accept: 'application/vnd.github+json' },
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`GitHub API error: ${res.status}`);
  }

  const data: Release = await res.json();

  // Preferir o instalador Windows; cair para o primeiro asset.
  const installer =
    data.assets.find((a) => /setup.*\.exe$/i.test(a.name)) ||
    data.assets.find((a) => /\.exe$/i.test(a.name)) ||
    data.assets[0] ||
    null;

  return {
    tag: data.tag_name,
    name: data.name || data.tag_name,
    published_at: data.published_at,
    html_url: data.html_url,
    body: data.body,
    installer,
    size_mb: installer ? +(installer.size / 1024 / 1024).toFixed(2) : 0,
    all_assets: data.assets,
  };
}

export async function fetchAllReleases(perPage = 20): Promise<Release[]> {
  const repo = getRepo();
  const res = await fetch(
    `${GITHUB_API}/repos/${repo}/releases?per_page=${perPage}`,
    { headers: { Accept: 'application/vnd.github+json' } }
  );

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status}`);
  }

  return (await res.json()) as Release[];
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

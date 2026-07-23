import type { APIRoute } from 'astro';
import { fetchAllReleases } from '../../lib/github';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const perPageRaw = url.searchParams.get('per_page');
  const perPage = perPageRaw ? Math.min(100, Math.max(1, Number(perPageRaw))) : 20;

  try {
    const releases = await fetchAllReleases(perPage);

    // Resposta resumida para reduzir payload.
    const summary = releases.map((r) => ({
      tag: r.tag_name,
      name: r.name,
      published_at: r.published_at,
      html_url: r.html_url,
      prerelease: r.prerelease,
      draft: r.draft,
      assets: r.assets.map((a) => ({
        name: a.name,
        url: a.browser_download_url,
        size: a.size,
        content_type: a.content_type,
      })),
    }));

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
    );
  }
};

import type { APIRoute } from 'astro';
import { fetchLatestRelease } from '../../lib/github';

// Esta rota é executada como serverless function na Vercel.
export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const data = await fetchLatestRelease();

    if (!data) {
      return new Response(
        JSON.stringify({ error: 'No release found', tag: null }),
        { status: 404, headers: jsonHeaders() }
      );
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        ...jsonHeaders(),
        // Cache no edge da Vercel por 5 minutos; stale-while-revalidate por 1h.
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: jsonHeaders() }
    );
  }
};

function jsonHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
  };
}

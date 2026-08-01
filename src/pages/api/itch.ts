import type { APIRoute } from 'astro';

export const prerender = false; // Forces this endpoint to run on the server (live)

export const GET: APIRoute = async () => {
  const apiKey = import.meta.env.ITCH_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ITCH_API_KEY not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const res = await fetch(`https://itch.io/api/1/${apiKey}/my-games`);
    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch from Itch.io API' }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await res.json();
    
    // ID of LIMINAL is 4838162
    const liminal = data.games?.find((g: any) => String(g.id) === '4838162');
    
    if (liminal) {
      return new Response(JSON.stringify({
        views: liminal.views_count || 0,
        downloads: liminal.downloads_count || 0,
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 's-maxage=60, stale-while-revalidate=300' // Cache for 60 seconds on Vercel CDN
        },
      });
    } else {
      return new Response(JSON.stringify({ error: 'LIMINAL game not found in account' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

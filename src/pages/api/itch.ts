import type { APIRoute } from 'astro';

// Correr no servidor: a chave da API nunca pode chegar ao browser.
export const prerender = false;

/**
 * `api.itch.io/profile/games` devolve todos os jogos da conta com
 * `views_count`, `downloads_count` e `purchases_count`.
 *
 * Não devolve impressões nem CTR — esses números existem apenas no dashboard,
 * atrás de sessão, e por isso ficam manuais em `src/data/projects.ts`.
 *
 * O endpoint antigo (`itch.io/api/1/<chave>/my-games`) responde 200 mesmo com
 * uma chave inválida, com o erro escondido no corpo. Este responde 403, que é
 * o que distingue "chave errada" de "jogo não encontrado".
 */
const ITCH_GAMES_URL = 'https://api.itch.io/profile/games';

const json = (body: unknown, status: number, cache?: string) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...(cache ? { 'Cache-Control': cache } : { 'Cache-Control': 'no-store' }),
    },
  });

export const GET: APIRoute = async ({ url }) => {
  const apiKey = import.meta.env.ITCH_API_KEY;

  if (!apiKey) {
    return json({ error: 'ITCH_API_KEY not configured' }, 500);
  }

  // Só dígitos: o parâmetro entra numa comparação, não num pedido, mas um id
  // livre tornaria os logs difíceis de ler e o cache da CDN infinito.
  const requested = url.searchParams.get('id') ?? '';
  if (!/^\d+$/.test(requested)) {
    return json({ error: 'Missing or invalid game id' }, 400);
  }

  let data: { games?: { id: number; views_count?: number; downloads_count?: number; purchases_count?: number }[] };

  try {
    const res = await fetch(ITCH_GAMES_URL, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
        'User-Agent': 'joaoafonso-portfolio',
      },
      // Sem isto um itch.io lento segura a função até ao timeout da Vercel.
      signal: AbortSignal.timeout(8000),
    });

    if (res.status === 401 || res.status === 403) {
      return json({ error: 'Itch.io rejected the API key' }, 502);
    }
    if (!res.ok) {
      return json({ error: `Itch.io responded ${res.status}` }, 502);
    }

    data = await res.json();
  } catch {
    // A mensagem original pode trazer a chave no URL; não vale a pena arriscar.
    return json({ error: 'Could not reach Itch.io' }, 502);
  }

  const game = data.games?.find((g) => String(g.id) === requested);

  if (!game) {
    return json({ error: 'Game not found in account' }, 404);
  }

  return json(
    {
      views: game.views_count ?? 0,
      downloads: game.downloads_count ?? 0,
      purchases: game.purchases_count ?? 0,
    },
    200,
    // Um pedido por minuto ao itch.io, no máximo; durante as 5 horas seguintes
    // a CDN serve o valor antigo e revalida em fundo, sem ninguém esperar.
    's-maxage=60, stale-while-revalidate=18000',
  );
};

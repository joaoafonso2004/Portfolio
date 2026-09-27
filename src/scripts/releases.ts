/**
 * Leitura dos releases e arranque de downloads, partilhados pela secção
 * Apps da homepage e pelos botões na página de cada projeto.
 *
 * O estado fica ao nível do módulo de propósito: com view transitions o
 * módulo sobrevive à troca de página, e voltar à homepage ou ao projeto não
 * volta a pedir nada.
 */
import { VERSIONS_PATH, releasesApi } from '../data/apps';
import type { AppConfig, PlatformRelease, VersionsFile } from '../data/apps';

export type AppReleases = Record<string, PlatformRelease | null>;

export const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export const formatSize = (bytes: number) => {
  if (!bytes) return '';
  const mb = bytes / 1024 / 1024;
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
};

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(
    new Date(iso)
  );

/**
 * Uma promessa e não um valor: duas partes da mesma página a pedir ao mesmo
 * tempo partilham o pedido em vez de o fazerem duas vezes. Uma falha resolve
 * a null e fica assim — quem não tem o ficheiro vai à API.
 */
let versions: Promise<VersionsFile | null> | null = null;

function loadVersions() {
  versions ??= fetch(VERSIONS_PATH, { cache: 'no-cache' })
    .then((res) => (res.ok ? (res.json() as Promise<VersionsFile>) : null))
    .catch(() => null);
  return versions;
}

const fromApi: Record<string, AppReleases> = {};

/**
 * Plano B: se o versions.json ainda não foi gerado, lê-se a API do GitHub
 * directamente. Mais lento e sujeito a 60 pedidos/hora por IP, mas evita
 * uma secção vazia enquanto a Action não corre pela primeira vez.
 */
async function fetchFromApi(app: AppConfig): Promise<AppReleases> {
  if (fromApi[app.id]) return fromApi[app.id];

  const res = await fetch(releasesApi(app), {
    headers: { Accept: 'application/vnd.github+json' },
  });
  if (!res.ok) throw new Error(String(res.status));
  const releases = await res.json();

  const platforms: AppReleases = {};
  for (const [platformId, platform] of Object.entries(app.platforms)) {
    const rel = releases
      .filter((r: any) => !r.draft && r.tag_name.startsWith(platform.tagPrefix))
      .sort(
        (a: any, b: any) =>
          new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
      )[0];
    if (!rel) {
      platforms[platformId] = null;
      continue;
    }
    const asset = rel.assets.find((a: any) => a.name === platform.asset) ?? null;
    platforms[platformId] = {
      version: rel.tag_name.slice(platform.tagPrefix.length),
      tag: rel.tag_name,
      notes: rel.body ?? '',
      publishedAt: rel.published_at,
      releaseUrl: rel.html_url,
      prerelease: rel.prerelease,
      asset: asset
        ? {
            name: asset.name,
            size: asset.size,
            url: asset.browser_download_url,
            downloads: asset.download_count,
          }
        : null,
      install: asset ? asset.browser_download_url : rel.html_url,
    };
  }
  fromApi[app.id] = platforms;
  return platforms;
}

/** O último release de cada plataforma da app. Rejeita se nem o ficheiro
 *  nem a API responderem. */
export async function loadReleases(app: AppConfig): Promise<AppReleases> {
  const entry = (await loadVersions())?.apps?.[app.id];
  return entry ?? fetchFromApi(app);
}

/**
 * O ficheiro entra por um iframe em vez de `location.href` ou de um link
 * normal. Uma navegação, mesmo que acabe em download, dispara `beforeunload`,
 * e o Layout sobe a página ao topo nesse evento; e quando há uma navegação a
 * seguir, as duas cancelavam-se uma à outra, conforme o browser.
 *
 * O iframe vai para `#download-frames`, que persiste entre paginas. No body
 * seria destruido no swap, e um download apanhado a meio do redirecto do
 * GitHub nunca chegaria a comecar.
 */
export function startDownload(url: string) {
  const host = document.getElementById('download-frames') ?? document.body;
  const frame = document.createElement('iframe');
  frame.src = url;
  host.appendChild(frame);
  // Depois de o browser assumir o ficheiro o iframe nao serve para nada, e
  // um por cada clique acumulava-se durante toda a visita.
  window.setTimeout(() => frame.remove(), 30000);
}

/** Um clique que quem clica quis dar de outra forma: outro separador, botão
 *  do meio, uma tecla modificadora. Esses nunca se reescrevem. */
export const isPlainClick = (ev: MouseEvent) =>
  !ev.defaultPrevented &&
  ev.button === 0 &&
  !(ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey);

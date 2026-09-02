/**
 * Tipos e helpers sobre `apps.json`.
 *
 * Os dados vivem em JSON e não aqui porque são lidos por dois consumidores
 * diferentes: o Astro (build do site) e `scripts/sync-releases.mjs`, que
 * corre em Node puro na Action e não sabe ler TypeScript.
 */
import config from './apps.json';

export type PlatformId = 'ios' | 'windows';

export interface Platform {
  label: string;
  /** Prefixo da tag que identifica esta plataforma: `ios-v1.2.0`.
   *  É o que permite lançar iOS sem mexer no Windows e vice-versa. */
  tagPrefix: string;
  /** Nome normalizado do ficheiro anexado ao release. */
  asset: string;
  /** Só iOS: instalação por `itms-services`. Exige .ipa assinado com perfil
   *  de distribuição (Ad Hoc/Enterprise). A true sem isso → "Unable to Install". */
  ota?: boolean;
}

export interface AppConfig {
  id: string;
  name: string;
  tagline: string;
  owner: string;
  repo: string;
  bundleId: string;
  /**
   * Slug da página do projeto em `/work/`. Só isto liga o botão de download
   * à transição em espiral — uma app sem página de projeto descarrega sem
   * animação nenhuma, que é o comportamento certo e não uma falha.
   */
  projectSlug?: string;
  tags: string[];
  platforms: Record<PlatformId, Platform>;
}

export const SITE_URL: string = config.siteUrl;
export const APPS = config.apps as AppConfig[];

/** Estrutura de `public/ota/versions.json`, gerada pela Action. */
export interface PlatformRelease {
  version: string;
  tag: string;
  notes: string;
  publishedAt: string;
  releaseUrl: string;
  prerelease: boolean;
  asset: {
    name: string;
    size: number;
    url: string;
    downloads: number;
  } | null;
  /** Para iOS com OTA ativo: link `itms-services`. Caso contrário, o URL directo. */
  install: string;
}

export interface VersionsFile {
  generatedAt: string;
  apps: Record<string, Record<string, PlatformRelease | null>>;
}

/**
 * Ficheiro servido pelo próprio portfólio — sem limite de pedidos e em cache
 * na CDN, ao contrário da API do GitHub (60/hora por IP).
 *
 * Dois formatos de propósito diferente, e trocá-los parte as coisas:
 *  - VERSIONS_PATH (relativo) para o site. Absoluto aqui faria o `astro dev`
 *    ir buscar dados a produção e falhar por CORS fora do domínio final.
 *  - VERSIONS_URL (absoluto) para as apps, que não correm numa origem web.
 */
export const VERSIONS_PATH = '/ota/versions.json';
export const VERSIONS_URL = `${SITE_URL}${VERSIONS_PATH}`;

export function releasesApi(app: AppConfig): string {
  return `https://api.github.com/repos/${app.owner}/${app.repo}/releases`;
}

export function otaInstallUrl(app: AppConfig): string {
  const manifest = `${SITE_URL}/ota/${app.id}/manifest.plist`;
  return `itms-services://?action=download-manifest&url=${encodeURIComponent(manifest)}`;
}

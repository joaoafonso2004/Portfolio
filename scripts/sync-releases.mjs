#!/usr/bin/env node
/**
 * Gera `public/ota/versions.json` e os `manifest.plist` a partir dos
 * releases do GitHub.
 *
 * O modelo é de *pull*, não de push: em vez de a app enviar os dados quando
 * lança, este script vai buscar o estado completo à API. Assim um webhook
 * perdido não deixa o site dessincronizado — a próxima corrida (agendada ou
 * manual) corrige tudo sozinha.
 *
 *   node scripts/sync-releases.mjs [--dry]
 *
 * GITHUB_TOKEN é opcional: sem ele são 60 pedidos/hora, com ele 5000.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DRY = process.argv.includes('--dry');

const config = JSON.parse(await readFile(join(ROOT, 'src/data/apps.json'), 'utf8'));
const { siteUrl, apps } = config;

const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'portfolio-release-sync',
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};

const escapeXml = (s) =>
  String(s).replace(/[<>&'"]/g, (c) => `&${{ '<': 'lt', '>': 'gt', '&': 'amp', "'": 'apos', '"': 'quot' }[c]};`);

async function fetchReleases(app) {
  const url = `https://api.github.com/repos/${app.owner}/${app.repo}/releases?per_page=100`;
  const res = await fetch(url, { headers });

  if (res.status === 404) {
    console.warn(`  ! ${app.owner}/${app.repo}: repositório não encontrado ou privado`);
    return [];
  }
  if (!res.ok) {
    // Falhar em silêncio aqui reescreveria o versions.json com tudo a null e
    // faria as apps julgarem que não há versões nenhumas.
    throw new Error(`GitHub API ${res.status} em ${url}: ${await res.text()}`);
  }
  return res.json();
}

/**
 * Release mais recente cuja tag pertence a esta plataforma.
 *
 * Rascunhos e pré-lançamentos ficam de fora de propósito: marcar um release
 * como pre-release no GitHub é o mecanismo para o tirar do site sem o apagar
 * (e para voltar atrás numa versão problemática).
 */
function pickRelease(releases, platform) {
  return (
    releases
      .filter((r) => !r.draft && !r.prerelease && r.tag_name.startsWith(platform.tagPrefix))
      .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))[0] ?? null
  );
}

function buildPlatform(app, platformId, platform, release) {
  if (!release) return null;

  const asset = release.assets.find((a) => a.name === platform.asset) ?? null;
  const version = release.tag_name.slice(platform.tagPrefix.length);

  // O URL /releases/latest/download/ aponta para o release mais recente do
  // repositório inteiro — com tags por plataforma isso seria a plataforma
  // errada metade das vezes. Fixa-se a tag concreta.
  const url = asset
    ? `https://github.com/${app.owner}/${app.repo}/releases/download/${release.tag_name}/${platform.asset}`
    : null;

  const ota = platformId === 'ios' && platform.ota === true;

  return {
    version,
    tag: release.tag_name,
    notes: (release.body ?? '').trim(),
    publishedAt: release.published_at,
    releaseUrl: release.html_url,
    prerelease: release.prerelease,
    asset: asset
      ? { name: asset.name, size: asset.size, url, downloads: asset.download_count }
      : null,
    install: ota
      ? `itms-services://?action=download-manifest&url=${encodeURIComponent(
          `${siteUrl}/ota/${app.id}/manifest.plist`
        )}`
      : (url ?? release.html_url),
  };
}

function buildManifest(app, ios) {
  const base = `${siteUrl}/ota/${app.id}`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>items</key>
  <array>
    <dict>
      <key>assets</key>
      <array>
        <dict>
          <key>kind</key>
          <string>software-package</string>
          <key>url</key>
          <string>${escapeXml(ios.asset.url)}</string>
        </dict>
        <dict>
          <key>kind</key>
          <string>display-image</string>
          <key>url</key>
          <string>${escapeXml(`${base}/icon-57.png`)}</string>
        </dict>
        <dict>
          <key>kind</key>
          <string>full-size-image</string>
          <key>url</key>
          <string>${escapeXml(`${base}/icon-512.png`)}</string>
        </dict>
      </array>
      <key>metadata</key>
      <dict>
        <key>bundle-identifier</key>
        <string>${escapeXml(app.bundleId)}</string>
        <key>bundle-version</key>
        <string>${escapeXml(ios.version)}</string>
        <key>kind</key>
        <string>software</string>
        <key>title</key>
        <string>${escapeXml(app.name)}</string>
      </dict>
    </dict>
  </array>
</dict>
</plist>
`;
}

/**
 * Entrada da app numa fonte do AltStore/SideStore.
 *
 * É isto que permite instalar e atualizar a partir do próprio iPhone: o
 * AltStore lê esta lista, vê que há uma versão mais recente que a instalada
 * e oferece o botão de atualizar — sem cabo e sem PC.
 *
 * A assinatura continua a ser feita pelo AltStore com o Apple ID do próprio
 * utilizador. Esta fonte é só o catálogo, não assina nada.
 */
function buildAltStoreApp(app, platform, releases) {
  const versions = releases
    .filter((r) => !r.draft && !r.prerelease && r.tag_name.startsWith(platform.tagPrefix))
    .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
    .map((r) => {
      const asset = r.assets.find((a) => a.name === platform.asset);
      if (!asset) return null;
      return {
        version: r.tag_name.slice(platform.tagPrefix.length),
        date: r.published_at,
        localizedDescription: (r.body ?? '').trim() || 'Sem notas nesta versão.',
        downloadURL: `https://github.com/${app.owner}/${app.repo}/releases/download/${r.tag_name}/${platform.asset}`,
        size: asset.size,
        minOSVersion: platform.minOSVersion ?? '15.0',
      };
    })
    .filter(Boolean)
    // Histórico completo tornaria o ficheiro enorme sem utilidade: o AltStore
    // só usa a mais recente e mostra as outras como histórico.
    .slice(0, 10);

  if (!versions.length) return null;

  const latest = versions[0];
  const icon = `${siteUrl}/ota/${app.id}/icon-512.png`;

  return {
    name: app.name,
    bundleIdentifier: app.bundleId,
    developerName: 'João Afonso',
    subtitle: 'YouTube e Spotify numa só biblioteca',
    localizedDescription: app.tagline,
    iconURL: icon,
    tintColor: platform.tintColor ?? '8B5CF6',
    category: 'entertainment',
    versions,
    // Campos no topo para compatibilidade com versões mais antigas do
    // AltStore, que ainda não liam o array `versions`.
    version: latest.version,
    versionDate: latest.date,
    versionDescription: latest.localizedDescription,
    downloadURL: latest.downloadURL,
    size: latest.size,
  };
}

const out = { generatedAt: new Date().toISOString(), apps: {} };
const altstore = {
  name: 'João Afonso',
  identifier: 'com.joaoafonso.altstore',
  subtitle: 'Apps próprias, distribuídas a partir do portfólio',
  description:
    'Fonte oficial das apps do João Afonso. As versões vêm dos GitHub Releases e são atualizadas automaticamente a cada lançamento.',
  iconURL: `${siteUrl}/favicon.svg`,
  website: siteUrl,
  tintColor: 'C8A96B',
  apps: [],
  news: [],
};
const files = [];

for (const app of apps) {
  console.log(`→ ${app.owner}/${app.repo}`);
  const releases = await fetchReleases(app);
  out.apps[app.id] = {};

  for (const [platformId, platform] of Object.entries(app.platforms)) {
    const release = pickRelease(releases, platform);
    const built = buildPlatform(app, platformId, platform, release);
    out.apps[app.id][platformId] = built;

    if (!built) {
      console.log(`  · ${platformId}: sem releases com prefixo "${platform.tagPrefix}"`);
    } else if (!built.asset) {
      console.warn(
        `  ! ${platformId}: ${built.tag} não tem o ficheiro "${platform.asset}" anexado`
      );
    } else {
      console.log(`  ✓ ${platformId}: ${built.version} (${built.asset.name})`);
    }
  }

  // Só se gera manifest quando há de facto um .ipa para instalar; um manifest
  // a apontar para o vazio dá "Unable to Install" sem explicação no iPhone.
  const ios = out.apps[app.id].ios;
  if (app.platforms.ios?.ota && ios?.asset) {
    files.push([join(ROOT, 'public/ota', app.id, 'manifest.plist'), buildManifest(app, ios)]);
  } else if (app.platforms.ios) {
    console.log('  · manifest.plist ignorado (ota desligado ou sem .ipa)');
  }

  if (app.platforms.ios) {
    const entry = buildAltStoreApp(app, app.platforms.ios, releases);
    if (entry) {
      altstore.apps.push(entry);
      console.log(`  ✓ altstore: ${entry.version} (${entry.versions.length} versões)`);
    } else {
      console.log('  · altstore: sem .ipa publicado');
    }
  }
}

files.push([join(ROOT, 'public/ota/altstore.json'), JSON.stringify(altstore, null, 2) + '\n']);

files.push([join(ROOT, 'public/ota/versions.json'), JSON.stringify(out, null, 2) + '\n']);

for (const [path, contents] of files) {
  if (DRY) {
    console.log(`\n--- ${path} ---\n${contents}`);
    continue;
  }
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, contents, 'utf8');
  console.log(`escrito ${path.replace(ROOT, '.')}`);
}

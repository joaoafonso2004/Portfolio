#!/usr/bin/env node
/**
 * Conta as contas do Duotone e escreve o número em `src/data/duotone-users.json`.
 *
 * Corre uma vez por dia no workflow `contar-utilizadores.yml`. É UM pedido ao
 * Auth do Supabase: a lista de utilizadores com `per_page=1`, e o total vem no
 * cabeçalho `x-total-count` (é o que o `listUsers` do supabase-js lê). A página
 * do Duotone lê o ficheiro ao compilar, por isso uma visita ao portfólio não
 * pergunta nada ao Supabase: no plano grátis, cada pedido é uma linha de log.
 *
 * O ficheiro só se reescreve quando o número muda, para não haver um commit
 * (e um deploy) por dia sem nada de novo. Uma falha sai com erro e deixa o
 * número de ontem: um ficheiro com 0 apagava o contador da página.
 *
 *   SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… node scripts/contar-utilizadores.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FICHEIRO = join(ROOT, 'src/data/duotone-users.json');

const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, '');
const chave = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
if (!url || !chave) {
  console.error('Faltam os segredos SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

// A chave antiga (service_role) é um JWT e vai também no Authorization. A nova
// (sb_secret_…) não é um JWT: vai só no apikey, e o Supabase troca-a por dentro.
const headers = { apikey: chave };
if (chave.startsWith('eyJ')) headers.Authorization = `Bearer ${chave}`;

const res = await fetch(`${url}/auth/v1/admin/users?page=1&per_page=1`, { headers });
// O corpo traz uma conta (com o email): lê-se para fechar o pedido, mas nunca
// se escreve no registo do workflow, que num repositório público é público.
const corpo = await res.text();
if (!res.ok) {
  console.error(`O Auth respondeu ${res.status}.`);
  if (res.status === 401 || res.status === 403) console.error('A chave não é a service_role (ou a secret) deste projeto.');
  else console.error(corpo.slice(0, 200));
  process.exit(1);
}

const cabecalho = res.headers.get('x-total-count');
const total = Number(cabecalho);
if (!cabecalho || !Number.isInteger(total) || total <= 0) {
  console.error(`O total não veio no cabeçalho x-total-count (veio: ${cabecalho ?? 'nada'}).`);
  process.exit(1);
}

let antes = null;
try {
  antes = JSON.parse(await readFile(FICHEIRO, 'utf8')).users ?? null;
} catch {
  // Primeira vez, ou um ficheiro estragado: escreve-se de novo.
}

if (antes === total) {
  console.log(`${total} contas, igual ao que já lá estava.`);
} else {
  const dados = { users: total, updatedAt: new Date().toISOString().slice(0, 10) };
  await writeFile(FICHEIRO, `${JSON.stringify(dados, null, 2)}\n`);
  console.log(`${antes ?? '?'} → ${total} contas.`);
}

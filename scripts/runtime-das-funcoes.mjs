#!/usr/bin/env node
/**
 * Marca as funções do Vercel com um runtime que o Vercel ainda aceita.
 *
 * O `@astrojs/vercel` 7.x é o último para o Astro 4, e só conhece o Node 18 e
 * o 20. Desde 1/10/2026 o Vercel já não compila com o Node 20 (os deploys
 * começaram todos a falhar, e o site ficou preso nas versões de 30/9). A build
 * passou para o Node 22 (`engines` no package.json), mas com um Node que não
 * conhece o adaptador escreve `nodejs18.x` nas funções -- e esse runtime o
 * Vercel também já não aceita. Este passo corre depois do `astro build` e põe
 * o runtime do Node com que se compilou.
 *
 * Sai quando o portfólio passar para o Astro 5 (`@astrojs/vercel` 8+, que
 * conhece o Node 22).
 *
 *   node scripts/runtime-das-funcoes.mjs
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FUNCOES = join(ROOT, '.vercel', 'output', 'functions');
const RUNTIME = 'nodejs22.x';

async function marcar(pasta) {
  let marcadas = 0;
  let entradas;
  try {
    entradas = await readdir(pasta, { withFileTypes: true });
  } catch {
    return 0; // sem funções (build estática): nada a fazer
  }
  for (const entrada of entradas) {
    if (!entrada.isDirectory()) continue;
    const caminho = join(pasta, entrada.name);
    if (!entrada.name.endsWith('.func')) {
      marcadas += await marcar(caminho);
      continue;
    }
    const config = join(caminho, '.vc-config.json');
    let dados;
    try {
      dados = JSON.parse(await readFile(config, 'utf8'));
    } catch {
      continue; // uma função sem config é um link, não se mexe
    }
    if (typeof dados.runtime === 'string' && dados.runtime.startsWith('nodejs') && dados.runtime !== RUNTIME) {
      console.log(`  ${entrada.name}: ${dados.runtime} -> ${RUNTIME}`);
      dados.runtime = RUNTIME;
      await writeFile(config, JSON.stringify(dados, null, 2));
    }
    marcadas++;
  }
  return marcadas;
}

const total = await marcar(FUNCOES);
console.log(`runtime das funções: ${total} função(ões) em ${RUNTIME}`);

# Gravações para a página do Duotone

A página já integra as cinco gravações recebidas: reprodução/capa no início, letras, equalizador, artista e partilha com amigos. Os textos foram reduzidos e a galeria social com separadores foi substituída por uma demonstração direta.

## Ficheiros tratados e privacidade

- Originais preservados em `C:/Users/Utilizador/Desktop/videos app/`. Não são copiados para a pasta pública.
- Os cinco MP4 finais são H.264, 384 × 848, sem faixa de áudio e com início de reprodução otimizado. Os vídeos usam 60 fps, exceto a partilha (30 fps, perfil Baseline para maior compatibilidade). Total aproximado: 5,7 MB, carregados apenas quando entram no ecrã; ao sair, libertam o descodificador para evitar vídeos pretos mais abaixo na página.
- Em `friends-demo.mp4`, nomes, utilizadores e fotos têm um desfoque forte, mantendo a lista original sem etiquetas ou avatares substitutos. O desfoque está incorporado nos píxeis do vídeo e do poster.
- O intervalo em que a janela de partilha aparece com transparência foi retirado. O desfoque cobre toda a altura da lista, incluindo o scroll final. Não depende de um efeito de CSS na página.
- `scripts/prepare-duotone-demos.mjs` reproduz os cortes e a ocultação. Recusa outra versão do vídeo de amigos através da verificação SHA-256; uma nova gravação precisa de nova inspeção e máscara.
- Foram inspecionados fotogramas ao longo do resultado, a transição entre as cenas, o scroll final e a imagem de capa. Os ficheiros de inspeção ficam fora do site.

Ainda faltam gravações da rádio, mini player/pinned, efeito reativo no PC e Connect. Essas funcionalidades têm descrições curtas e as imagens disponíveis; não há espaços vazios ou avisos de «em breve» na página.

## Como gravar

- iPhone na vertical, gravação de ecrã na resolução original; PC na horizontal, idealmente 1920 × 1080.
- 10–20 segundos por demonstração. Deixar 2 segundos de repouso no início e no fim.
- Um gesto de cada vez, com pausas curtas para se perceber o resultado. Evitar scroll muito rápido.
- Sem cortes, zoom, molduras, música adicionada, narração ou legendas. Enviar os ficheiros originais; a montagem e compressão ficam para a integração.
- Ativar Não incomodar e usar uma conversa de demonstração sem informação pessoal.
- A página reproduz os vídeos sem som. Para o efeito reativo no PC, manter a música a tocar durante a captura, para o movimento ser real.

## iOS — por ordem de prioridade

| Vídeo | Sequência | Duração |
| --- | --- | --- |
| Capa e letras | Começar na capa 3D com uma música a tocar → deixar ver o movimento → rodar para as letras → esperar que avancem → voltar à capa. Já existe uma gravação utilizável; uma nova é opcional. | 10–15 s |
| Equalizador | Abrir o EQ → ajustar Bass, Sub, Punch e Warm com movimentos curtos → mudar a velocidade → voltar ao player. Opcional: sair da faixa e voltar para mostrar que os ajustes foram guardados. | 15–20 s |
| Rádio | Mostrar a música atual → abrir Radio → escolher Songs like this one → mostrar a fila → reabrir o menu e escolher Mix → mostrar a nova fila. Pode ser enviado em dois clips. | 15–20 s |
| Social | Abrir um amigo de demonstração → partilhar uma música na conversa → abrir a música recebida. Num segundo clip, abrir uma playlist colaborativa e mostrar os colaboradores e uma música adicionada por um amigo. | 10–15 s cada |
| Artista | Abrir um artista com bastante conteúdo → mostrar músicas e colaborações → passar pelos álbuns e singles → terminar em Fans also like e abrir um artista relacionado. | 15–20 s |

## PC e entre dispositivos

| Vídeo | Sequência | Duração |
| --- | --- | --- |
| Mini player e pinned | Abrir o mini player → arrastar para um canto → redimensionar → expandir para mostrar a fila. Num segundo clip curto, fixar uma playlist ou artista e abri-lo pela área Pinned. | 12–20 s cada |
| Efeito reativo | Abrir Now Playing com música a tocar → deixar o efeito reagir → mudar a intensidade uma vez → voltar à intensidade inicial. | 10–15 s |
| Duotone Connect | Gravar iPhone e PC em simultâneo: música no iPhone → passar para o PC → pausar/retomar e avançar uma faixa pelo iPhone, vendo a resposta no PC. Enviar os dois ficheiros originais, para montar lado a lado. | 15–20 s |

## Integração

1. Selecionar e cortar a ação mais clara; montar os clips relacionados quando necessário. Reservar uma transição natural entre o fim e o início do loop.
2. Exportar MP4/H.264 sem áudio, com `faststart`, e um poster correspondente ao primeiro fotograma. Evitar uma resolução maior do que a necessária para a apresentação.
3. Colocar os ficheiros finais em `public/work/duotone/` e registar os caminhos em `src/data/duotone-demos.ts`.
4. As chaves disponíveis são `hero`, `player`, `equalizer`, `desktop`, `connect`, `radio`, `artist` e `social`. `desktop` pode reunir mini player, pinned e efeito reativo. `social` pode reunir partilha e colaboração.
5. Quando existe uma gravação, `DuotoneDemo.astro` substitui a captura da secção. Os vídeos só são carregados e reproduzidos quando entram no ecrã; ficam em loop e sem som, com pausa manual. A preferência de redução de movimento desativa a reprodução automática. Sem JavaScript há um link direto para a gravação.

## Base das descrições

As descrições foram cruzadas com o código local em `duotone-main`: `lib/equalizer.ts`, `lib/playbackRate.ts`, `lib/adjustmentSync.ts`, `janelaMini.web.tsx`, `electron/miniLeitor.cjs`, `lib/atalhosDaLateral.ts`, `lib/duotoneConnect.ts`, `lib/sessionSync.ts`, `lib/menuDoRadio.ts`, `lib/mixDoRadio.ts`, `lib/playlistColaborativa.ts`, `api/social.ts`, `desktop/glitch/GlitchArtwork.web.tsx` e as páginas de artista/importação.

O posicionamento destaca a experiência do Duotone sem alegações de exclusividade universal. A existência de controlo remoto, playlists colaborativas e equalizador no Spotify foi confirmada nas páginas oficiais:

- https://support.spotify.com/us/article/spotify-connect/
- https://support.spotify.com/vc/article/collaborative-playlists/
- https://support.spotify.com/cw-en/article/equalizer/

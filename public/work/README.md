# Vídeos de pré-visualização dos projetos

Cada tile da secção "Selected Work" mostra um vídeo em hover. O caminho está
definido no campo `video` de cada projeto em `src/components/Work.astro`:

| Projeto           | Ficheiro esperado |
| ----------------- | ----------------- |
| Red Bull Editions | `redbull.mp4`     |
| Neapolitan Space  | `pizzaria.mp4`    |
| Siroco Tours      | `siroco.mp4`      |
| Duotone           | `duotone.mp4`     |

Enquanto um ficheiro não existir, o tile mostra apenas a imagem — o vídeo só
é revelado depois de começar mesmo a reproduzir, por isso não há retângulos
pretos nem erros visíveis.

## Como gravar

- **Formato:** MP4, codec H.264, `yuv420p` (é o que o Safari exige).
- **Proporção:** quadrada, 1:1. Os tiles são quadrados e o vídeo é cortado
  com `object-cover` — gravar em 16:9 faz perder as laterais.
- **Duração:** 4 a 8 segundos, em loop. Repete sozinho.
- **Sem áudio:** os vídeos são silenciados à força (os browsers só deixam
  arrancar automaticamente vídeos sem som). Remover a faixa poupa tamanho.
- **Tamanho:** o objetivo é ficar abaixo de ~2 MB por vídeo. São
  descarregados só em hover, mas continuam a ser dados de quem visita.

Comando para converter uma gravação de ecrã em algo adequado:

```bash
ffmpeg -i gravacao.mov -an -vf "crop=min(iw\,ih):min(iw\,ih),scale=720:720" \
  -c:v libx264 -crf 26 -pix_fmt yuv420p -movflags +faststart redbull.mp4
```

`-an` remove o áudio, o `crop` corta ao centro em quadrado e o `-crf 26`
equilibra qualidade e peso (baixar o número aumenta a qualidade e o tamanho).

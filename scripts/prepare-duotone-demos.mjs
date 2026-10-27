/**
 * Prepare the five recordings supplied on 2026-10-27.
 * Usage: node scripts/prepare-duotone-demos.mjs <input-folder> <review-output-folder>
 * Review before copying outputs to public/work/duotone. Originals stay private.
 * The privacy edit is tied to an exact input hash; never reuse it on new footage.
 */
import { createHash } from 'node:crypto';
import { readFileSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';

const [sourceFolder, outputFolder] = process.argv.slice(2);
if (!sourceFolder || !outputFolder) throw new Error('Provide input and review output folders.');
const input = resolve(sourceFolder);
const output = resolve(outputFolder);
if (input === output) throw new Error('Keep the original recordings separate.');
mkdirSync(output, { recursive: true });
const socialSource = join(input, 'sending to friends.mp4');
const hash = createHash('sha256').update(readFileSync(socialSource)).digest('hex');
if (hash !== '564a9628e876a332d26b288c6663a6613661310a9d997695a43efb600b43bb2a') {
  throw new Error('Unreviewed social recording: inspect every transition and define new privacy masks first.');
}

function ffmpeg(args) {
  const result = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit', windowsHide: true });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Video processing failed (${result.status}).`);
}
const encode = ['-an', '-map_metadata', '-1', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'];
function clip(file, name, start, duration, posterTime) {
  const destination = join(output, `${name}-demo.mp4`);
  ffmpeg(['-ss', String(start), '-i', join(input, file), '-t', String(duration), '-vf', 'fps=60,setsar=1', ...encode, destination]);
  poster(destination, name, posterTime);
}
function poster(file, name, time) {
  ffmpeg(['-ss', String(time), '-i', file, '-frames:v', '1', '-update', '1', '-q:v', '2', join(output, `${name}-poster.jpg`)]);
}

clip('playing music.mp4', 'playing', 0.5, 7.7, 1);
clip('lyrics.mp4', 'lyrics', 1.5, 13.8, 3.5);
clip('Artist.mp4', 'artist', 0.8, 14.5, 1.5);

const eqOutput = join(output, 'equalizer-demo.mp4');
ffmpeg(['-i', join(input, 'equalizer.mp4'), '-filter_complex',
  '[0:v]split[a][b];[a]trim=start=1:end=4.6,setpts=PTS-STARTPTS[a1];[b]trim=start=9:end=20,setpts=PTS-STARTPTS[b1];[a1][b1]concat=n=2:v=1:a=0,fps=60,setsar=1[out]',
  '-map', '[out]', ...encode, eqOutput]);
poster(eqOutput, 'equalizer', 8);

// Original frames 0.5–3.28 contain only the player and its generic share menu.
// Omit the sheet's translucent entrance entirely: identities appear during it.
// The list viewport (including its final scroll) is y=426..712.
// Blur x=12..226 across that whole viewport, including the names and photos.
// Apply the blur to the recording itself, not a removable webpage overlay.
// Selection circles, song artwork, the search field and Send remain original.
const socialFilter = [
  '[0:v]split[before][after]',
  '[before]trim=start=0.5:end=3.28,setpts=PTS-STARTPTS,fps=60,setsar=1[first]',
  '[after]trim=start=3.85:end=5.98,setpts=PTS-STARTPTS,fps=60,setsar=1[panel]',
  '[panel]split[panelbase][identities]',
  '[identities]gblur=sigma=16:steps=3,crop=214:286:12:426[blurred]',
  '[panelbase][blurred]overlay=x=12:y=426:shortest=1,tpad=stop_mode=clone:stop_duration=1[second]',
  '[first][second]concat=n=2:v=1:a=0,format=yuv420p[out]',
].join(';');
const socialOutput = join(output, 'friends-demo.mp4');
// Use a simple, fixed-rate stream with frequent keyframes for reliable looping
// in embedded browsers. The privacy blur is already baked into every list frame.
ffmpeg(['-i', socialSource, '-filter_complex', socialFilter, '-map', '[out]', ...encode,
  '-r', '30', '-profile:v', 'baseline', '-level:v', '3.1', '-bf', '0', '-g', '60', '-keyint_min', '60', '-sc_threshold', '0', socialOutput]);
poster(socialOutput, 'friends', 4);
console.log('Five muted videos and posters prepared. Review the social output before publication.');

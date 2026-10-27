/** Real recordings only. An empty slot renders its existing screenshot. */
export interface DuotoneDemo {
  src: string;
  poster?: string;
}

export const duotoneDemos: Partial<Record<'hero' | 'player' | 'equalizer' | 'desktop' | 'connect' | 'radio' | 'artist' | 'social', DuotoneDemo>> = {
  hero: {
    src: '/work/duotone/playing-demo.mp4',
    poster: '/work/duotone/playing-poster.jpg',
  },
  player: {
    src: '/work/duotone/lyrics-demo.mp4',
    poster: '/work/duotone/lyrics-poster.jpg',
  },
  equalizer: {
    src: '/work/duotone/equalizer-demo.mp4',
    poster: '/work/duotone/equalizer-poster.jpg',
  },
  artist: {
    src: '/work/duotone/artist-demo.mp4',
    poster: '/work/duotone/artist-poster.jpg',
  },
  social: {
    src: '/work/duotone/friends-demo.mp4?v=blur-2',
    poster: '/work/duotone/friends-poster.jpg',
  },
};

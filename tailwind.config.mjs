/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,ts,md,mdx}'],
  theme: {
    extend: {
      screens: {
        /**
         * The Work ring is a pointer composition: it needs real estate in BOTH
         * axes (eight overlapping cards collapse into a pile on a narrow or a
         * short screen — a landscape phone is wide but ~390px tall) AND a
         * hovering pointer, because hover is the only thing that reveals which
         * project a card is. A tablet fails the last test even at 1024px tall,
         * so it gets the touch rail like every other finger-driven device.
         */
        /* Named `orbit`, not `ring`: Tailwind already owns `ring` for
           box-shadow utilities, and a screen of the same name is silently
           swallowed — every `ring:` variant compiles to nothing. */
        orbit: {
          raw: '(min-width: 768px) and (min-height: 620px) and (hover: hover) and (pointer: fine)',
        },
      },
      colors: {
        ink: '#090A0C',
        coal: '#141516',
        paper: '#F2EFE8',
        muted: '#8B8D91',
        accent: '#C8A96B',
        line: 'rgba(242, 239, 232, 0.12)',
      },
      fontFamily: {
        display: ['"Clash Display"', 'system-ui', 'sans-serif'],
        sans: ['"Satoshi"', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};

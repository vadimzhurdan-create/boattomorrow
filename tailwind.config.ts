import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#FAFAF8',
        'bg-alt': '#F5F5F3',
        text: '#111111',
        muted: '#4A4A4A',
        'muted-light': '#6B6B6B',
        border: '#E0E0E0',
        accent: '#E8500A',
        'accent-dark': '#D04500',
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'display-md': ['1.75rem', { lineHeight: '1.3' }],
      },
    },
  },
  plugins: [],
}

export default config

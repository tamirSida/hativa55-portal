import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          50: '#f0f9ff',
          500: '#00a1d6',
          600: '#0284c7',
          700: '#0369a1',
        },
      },
      fontFamily: {
        'hebrew': ['Open Sans Hebrew', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
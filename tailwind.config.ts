import type { Config } from 'tailwindcss'

const config = {
  // darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config

export default config
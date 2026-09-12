/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg:     '#0A0A0B',
        bg2:    '#111113',
        border: '#1E1E22',
        fg:     '#F0EDE8',
        fg2:    '#6B6870',
        accent: '#E8E4DF',
      },
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      letterSpacing: { tighter: '-0.04em', wide: '0.12em', wider: '0.22em' },
    },
  },
  plugins: [],
}

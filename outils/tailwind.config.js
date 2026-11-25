/* Configuration Tailwind (build du CSS). Palette sobre : emerald = bleu nuit (encre), gold = or ancien, cream = papier chaud. */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './kitab-*/*.html', './assets/app.js'],
  theme: {
    extend: {
      colors: {
        emerald: {
          50: '#f3f5f8', 100: '#e3e8ee', 200: '#c6d0dc', 300: '#9aabbf', 400: '#6b829c',
          500: '#46607d', 600: '#334b68', 700: '#263b55', 800: '#1c2e45', 850: '#162538',
          900: '#111d2e', 950: '#0b1522'
        },
        gold: { 300: '#e6cf9a', 400: '#cfae6a', 500: '#b8924a', 600: '#7d5c1f', 700: '#6f5019' },
        cream: { 50: '#faf8f3', 100: '#f2eee4', 200: '#e5dfd0' },
        slate: { 700: '#2b3a4d', 800: '#1c2836', 900: '#131c27', 950: '#0c131b' }
      },
      fontFamily: {
        arabic: ['Amiri', 'Traditional Arabic', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Literata', 'Georgia', 'Times New Roman', 'serif']
      }
    }
  }
};

/* Configuration Tailwind (build du CSS). Palette issue du logo : emerald = bleu pétrole, gold = jaune de l'ampoule. */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './kitab-*/*.html', './assets/app.js'],
  theme: {
    extend: {
      colors: {
        emerald: {
          50: '#eef8fd', 100: '#d6eefa', 200: '#aadcf2', 300: '#6cc3e6', 400: '#33a8d6',
          500: '#0b86b5', 600: '#00709c', 700: '#005c83', 800: '#004a6b', 850: '#003c58',
          900: '#00304a', 950: '#00263f'
        },
        gold: { 300: '#ffe08a', 400: '#ffcb33', 500: '#ffb344', 600: '#8f5506', 700: '#965a08' },
        cream: { 50: '#f4fafd', 100: '#e6f3fa', 200: '#cfe7f3' },
        slate: { 700: '#144463', 800: '#0a3350', 900: '#062741', 950: '#001d31' }
      },
      fontFamily: {
        arabic: ['Amiri', 'Traditional Arabic', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Literata', 'Georgia', 'Times New Roman', 'serif']
      }
    }
  }
};

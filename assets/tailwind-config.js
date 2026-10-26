/* Configuration Tailwind partagée par toutes les pages.
   Palette issue du logo (assets/logo.png) :
   - « emerald » = bleu pétrole du logo (#005c83) jusqu'au bleu nuit (#00263f)
   - « gold »    = jaune / orange de l'ampoule (#ffcb33, #ffb344)
   - « cream »   = fond bleu très clair
   (les noms de classes sont conservés pour ne pas modifier les pages) */
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        emerald: {
          50: '#eef8fd', 100: '#d6eefa', 200: '#aadcf2', 300: '#6cc3e6', 400: '#33a8d6',
          500: '#0b86b5', 600: '#00709c', 700: '#005c83', 800: '#004a6b', 850: '#003c58',
          900: '#00304a', 950: '#00263f'
        },
        gold: { 300: '#ffe08a', 400: '#ffcb33', 500: '#ffb344', 600: '#b8700c', 700: '#965a08' },
        cream: { 50: '#f4fafd', 100: '#e6f3fa', 200: '#cfe7f3' },
        slate: { 700: '#144463', 800: '#0a3350', 900: '#062741', 950: '#001d31' }
      },
      fontFamily: {
        arabic: ['Amiri', 'Traditional Arabic', 'serif'],
        sans: ['Inter', 'sans-serif']
      }
    }
  }
};

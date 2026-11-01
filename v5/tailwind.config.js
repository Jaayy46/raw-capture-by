/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        /* Measured across all 34 photographs: mean lightness 0.39,
           warm-dominant. A cream page would make dark images read as
           holes punched in paper, and a black one would swallow them.
           This ground sits between — cool and unsaturated, so the warm
           work sings against it. Nothing here is chromatic: every
           colour on the site comes out of the photographs. */
        paper:  '#E7E8E4',   // ground
        paper2: '#DDDED9',   // recessed panels
        rule:   '#C6C8C2',   // hairlines
        ink:    '#191B19',   // primary text
        ink2:   '#5C615C',   // secondary text
        ink3:   '#8A8F89',   // tertiary / captions
      },
      fontFamily: {
        sans: ['Archivo', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      maxWidth: { prose: '62ch' },
    },
  },
  plugins: [],
}

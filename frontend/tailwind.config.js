export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F4F6F9',
        surface: '#FFFFFF',
        ink: '#172033',
        muted: '#586378',
        rule: '#D8DEE7',
        focus: '#2952CC',
        danger: '#A8261D',
        caution: '#8A5A00',
        safe: '#1D6B47',
      },
      fontFamily: {
        sans: ['"Public Sans"', 'system-ui', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}

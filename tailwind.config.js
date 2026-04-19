/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        matrix: {
          black: '#0a0a0a',
          dark: '#0d1117',
          darker: '#060a0f',
          card: '#0f1923',
          'card-hover': '#131f2e',
          border: '#1a2a3a',
          green: '#00ff41',
          'green-dim': '#00cc33',
          'green-dark': '#003d10',
          'green-glow': 'rgba(0, 255, 65, 0.15)',
          cyan: '#00e5ff',
          'cyan-glow': 'rgba(0, 229, 255, 0.1)',
          text: '#e0e0e0',
          'text-muted': '#6b7b8d',
          'text-dim': '#3a4a5a',
        },
      },
      fontFamily: {
        mono: ['"Share Tech Mono"', 'Consolas', 'monospace'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      animation: {
        'typing': 'typing 3.5s steps(30, end) forwards, blink-caret 0.75s step-end infinite',
        'blink': 'blink-caret 0.75s step-end infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.6s ease forwards',
        'fade-in-left': 'fadeInLeft 0.6s ease forwards',
        'fade-in-right': 'fadeInRight 0.6s ease forwards',
        'scan-line': 'scanLine 8s linear infinite',
        'glitch': 'glitch 3s infinite',
        'matrix-glow': 'matrixGlow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'blink-caret': {
          '0%, 100%': { borderColor: 'transparent' },
          '50%': { borderColor: '#00ff41' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0, 255, 65, 0.3), 0 0 20px rgba(0, 255, 65, 0.1)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 255, 65, 0.6), 0 0 40px rgba(0, 255, 65, 0.2)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInLeft: {
          from: { opacity: '0', transform: 'translateX(-30px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        fadeInRight: {
          from: { opacity: '0', transform: 'translateX(30px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        scanLine: {
          '0%': { top: '-10%' },
          '100%': { top: '110%' },
        },
        glitch: {
          '0%, 90%, 100%': { transform: 'translate(0)' },
          '92%': { transform: 'translate(-2px, 2px)' },
          '94%': { transform: 'translate(2px, -2px)' },
          '96%': { transform: 'translate(-1px, -1px)' },
          '98%': { transform: 'translate(1px, 1px)' },
        },
        matrixGlow: {
          from: { textShadow: '0 0 10px rgba(0, 255, 65, 0.5), 0 0 20px rgba(0, 255, 65, 0.3)' },
          to: { textShadow: '0 0 20px rgba(0, 255, 65, 0.8), 0 0 40px rgba(0, 255, 65, 0.4), 0 0 60px rgba(0, 255, 65, 0.2)' },
        },
      },
      backgroundImage: {
        'matrix-gradient': 'linear-gradient(135deg, #0a0a0a 0%, #0d1117 50%, #060a0f 100%)',
        'green-gradient': 'linear-gradient(135deg, #00ff41 0%, #00cc33 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(0, 255, 65, 0.03) 0%, rgba(0, 0, 0, 0) 100%)',
      },
      boxShadow: {
        'matrix': '0 0 15px rgba(0, 255, 65, 0.1)',
        'matrix-lg': '0 0 30px rgba(0, 255, 65, 0.15), 0 0 60px rgba(0, 255, 65, 0.05)',
        'matrix-glow': '0 0 20px rgba(0, 255, 65, 0.4), 0 0 40px rgba(0, 255, 65, 0.2)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 8px 40px rgba(0, 255, 65, 0.15), 0 0 20px rgba(0, 255, 65, 0.1)',
      },
    },
  },
  plugins: [],
}
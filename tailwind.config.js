/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'versace-night': '#0e0b14',
        'versace-panel': '#151020',
        'versace-border': '#322140',
        'versace-highlight': '#a66bff',
        'versace-accent': '#6f3bcf',
      },
      boxShadow: {
        neon: '0px 15px 45px rgba(119, 54, 209, 0.35)',
      },
      fontFamily: {
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [require('daisyui'), require('@tailwindcss/forms')],
  daisyui: {
    themes: [
      {
        versace: {
          primary: '#c084fc',
          secondary: '#8b5cf6',
          accent: '#f472b6',
          neutral: '#1f172c',
          'base-100': '#0e0b14',
          info: '#38bdf8',
          success: '#34d399',
          warning: '#fbbf24',
          error: '#f87171',
        },
      },
    ],
    darkTheme: 'versace',
  },
}


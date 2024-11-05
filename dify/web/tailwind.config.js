/** @type {import('tailwindcss').Config} */
import tailwindThemeVarDefine from './themes/tailwind-theme-var-define'
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './context/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    typography: require('./typography'),
    extend: {
      colors: {
        gray: {
          25: 'var(--color-basic-gray-25)',
          50: 'var(--color-basic-gray-50)',
          100: 'var(--color-basic-gray-100)',
          200: 'var(--color-basic-gray-200)',
          300: 'var(--color-basic-gray-300)',
          400: 'var(--color-basic-gray-400)',
          500: 'var(--color-basic-gray-500)',
          700: 'var(--color-basic-gray-600)',
          600: 'var(--color-basic-gray-700)',
          800: 'var(--color-basic-gray-800)',
          900: 'var(--color-basic-gray-900)',
        },
        primary: {
          25: 'var(--color-basic-primary-25)',
          50: 'var(--color-basic-primary-50)',
          100: 'var(--color-basic-primary-100)',
          200: 'var(--color-basic-primary-200)',
          300: 'var(--color-basic-primary-300)',
          400: 'var(--color-basic-primary-400)',
          500: 'var(--color-basic-primary-500)',
          600: 'var(--color-basic-primary-600)',
          700: 'var(--color-basic-primary-700)',
          800: 'var(--color-basic-primary-800)',
          900: 'var(--color-basic-primary-900)',
        },
        blue: {
          50: 'var(color-basic-blue-50)',
          100: 'var(color-basic-blue-100)',
          200: 'var(color-basic-blue-200)',
          300: 'var(color-basic-blue-300)',
          400: 'var(color-basic-blue-400)',
          500: 'var(color-basic-blue-500)',
          600: 'var(color-basic-blue-600)',
          700: 'var(color-basic-blue-700)',
          800: 'var(color-basic-blue-800)',
          900: 'var(color-basic-blue-900)',
        },
        green: {
          50: '#F3FAF7',
          100: '#DEF7EC',
          800: '#03543F',
        },
        yellow: {
          100: '#FDF6B2',
          800: '#723B13',
        },
        purple: {
          50: '#F6F5FF',
          200: '#DCD7FE',
        },
        indigo: {
          25: '#F5F8FF',
          50: '#EEF4FF',
          100: '#E0EAFF',
          300: '#A4BCFD',
          400: '#8098F9',
          600: '#444CE7',
          800: '#2D31A6',
        },
        ...tailwindThemeVarDefine,
      },
      screens: {
        'mobile': '100px',
        // => @media (min-width: 100px) { ... }
        'tablet': '640px', // 391
        // => @media (min-width: 600px) { ... }
        'pc': '769px',
        // => @media (min-width: 769px) { ... }
        '3xl': '1880px',
      },
      boxShadow: {
        'xs': 'var(--shadow-xs)',
        'sm': 'var(--shadow-s)',
        'md': 'var(--shadow-m)',
        'lg': 'var(--shadow-l)',
        'xl': 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        '3xl': 'var(--shadow-3xl)',
      },
      opacity: {
        2: '0.02',
        8: '0.08',
      },
      fontSize: {
        '2xs': '0.625rem',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
  // https://github.com/tailwindlabs/tailwindcss/discussions/5969
  corePlugins: {
    preflight: false,
  },
}

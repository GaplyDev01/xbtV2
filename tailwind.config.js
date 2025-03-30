/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'xs': '480px',
        'xxs': '360px',
      },
      fontSize: {
        'xxs': '0.6rem',
        'tiny': '0.65rem',
        'xs': '0.7rem',
        'sm': '0.8rem',
        'base': '0.9rem',
        'lg': '1rem',
        'xl': '1.1rem',
        '2xl': '1.2rem',
      },
      colors: {
        peach: {
          DEFAULT: 'rgb(255, 199, 153)',
          light: 'rgb(255, 212, 179)',
          dark: 'rgb(255, 186, 128)'
        },
        mint: {
          DEFAULT: 'rgb(113, 197, 143)',
          light: 'rgb(143, 210, 166)',
          dark: 'rgb(83, 183, 120)'
        },
        sand: {
          DEFAULT: 'rgb(211, 180, 132)',
          light: 'rgb(223, 196, 157)',
          dark: 'rgb(199, 164, 107)'
        },
        carbon: {
          DEFAULT: 'rgb(28, 28, 28)',
          light: 'rgb(42, 42, 42)',
          dark: 'rgb(14, 14, 14)'
        },
        ocean: {
          DEFAULT: 'rgb(81, 154, 186)',
          light: 'rgb(111, 172, 197)',
          dark: 'rgb(51, 136, 175)'
        },
        theme: {
          bg: 'rgb(var(--theme-bg) / <alpha-value>)',
          'bg-secondary': 'rgb(var(--theme-bg-secondary) / <alpha-value>)',
          border: 'rgb(var(--theme-border) / <alpha-value>)',
          accent: 'rgb(var(--theme-accent) / <alpha-value>)',
          'accent-dark': 'rgb(var(--theme-accent-dark) / <alpha-value>)',
          text: {
            primary: 'rgb(var(--theme-text-primary) / <alpha-value>)',
            secondary: 'rgb(var(--theme-text-secondary) / <alpha-value>)',
            accent: 'rgb(var(--theme-text-accent) / <alpha-value>)'
          }
        }
      },
      borderColor: {
        DEFAULT: 'rgb(var(--theme-border) / <alpha-value>)'
      },
      borderRadius: {
        lg: "0.375rem",
        md: "0.25rem", 
        sm: "0.125rem",
      },
      animation: {
        'gradient-x': 'gradient-x 3s ease infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        }
      },
      fontFamily: {
        'rider': ['Rider Condensed', 'sans-serif'],
        'lemon': ['LEMON MILK Pro', 'sans-serif']
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('tailwindcss-animate'),
  ],
};
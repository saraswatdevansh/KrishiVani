/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#00450d",
        "primary-container": "#1b5e20",
        "on-primary": "#ffffff",
        "on-primary-container": "#e8f5e9",
        
        "secondary": "#286b33",
        "secondary-container": "#abf4ac",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#134e19",

        "tertiary": "#00450d",
        "tertiary-container": "#055f18",
        "on-tertiary-container": "#86d881",

        "background": "#f8faf8",
        "surface": "#f8faf8",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f2f4f2",
        "surface-container": "#eceeec",
        "surface-container-high": "#e6e9e7",
        
        "on-background": "#191c1b",
        "on-surface": "#191c1b",
        "on-surface-variant": "#41493e",
        
        "error": "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",

        "warning": "#b26a00",
        "warning-container": "#ffe082",
        "on-warning-container": "#5d3500",

        "outline": "#717a6d",
        "outline-variant": "#c0c9bb",
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 16px rgba(0, 0, 0, 0.05)',
        'float': '0 8px 24px rgba(0, 69, 13, 0.15)',
        'modal': '0 20px 40px rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      }
    },
  },
  plugins: [],
}

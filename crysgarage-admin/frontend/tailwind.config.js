/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: 'rgb(var(--brand) / <alpha-value>)',
        brandFg: 'rgb(var(--brand-foreground) / <alpha-value>)',
      },
      boxShadow: {
        brand: '0 10px 25px -10px rgba(var(--brand), 0.45)',
      },
    },
  },
  plugins: [],
}

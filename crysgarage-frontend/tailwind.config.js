/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./App.tsx",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'crys-black': '#0a0a0a',
                'crys-charcoal': '#1a1a1a',
                'crys-graphite': '#2a2a2a',
                'crys-gold': '#d4af37',
                'crys-gold-muted': '#b8941f',
                'crys-white': '#ffffff',
                'crys-light-grey': '#e8e8e8',
                'audio-panel-bg': '#1a1a1a',
                'audio-panel-border': '#d4af37',
                'audio-inactive': '#404040',
                'audio-active': '#d4af37',
                'signal-flow': '#d4af37'
            },
            fontFamily: {
                'sans': ['Inter', 'system-ui', 'sans-serif'],
                'mono': ['JetBrains Mono', 'monospace']
            },
            animation: {
                'pulse-gold': 'pulse-gold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'flow-signal': 'flow-signal 3s ease-in-out infinite'
            },
            keyframes: {
                'pulse-gold': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.5' }
                },
                'flow-signal': {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '50%': { transform: 'translateX(10px)' }
                }
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            }
        },
    },
    plugins: [require( "tailwindcss-animate" )],
} 
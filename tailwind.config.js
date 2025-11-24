/** @type {import('tailwindcss').Config} */
export default {
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			colors: {
				primary: {
					50: '#f0f4ff',
					100: '#e0e9ff',
					200: '#c7d7fe',
					300: '#a5b8fc',
					400: '#818cf8',
					500: '#6366f1',
					600: '#4f46e5',
					700: '#4338ca',
					800: '#3730a3',
					900: '#312e81',
				},
			},
			spacing: {
				'touch': '2.75rem', // 44px - área táctil mínima
				'touch-comfort': '3rem', // 48px - área táctil cómoda
			},
			safeArea: {
				top: 'env(safe-area-inset-top)',
				bottom: 'env(safe-area-inset-bottom)',
				left: 'env(safe-area-inset-left)',
				right: 'env(safe-area-inset-right)',
			},
			fontSize: {
				'xs': ['0.75rem', { lineHeight: '1.5' }],
				'sm': ['0.875rem', { lineHeight: '1.5' }],
				'base': ['1rem', { lineHeight: '1.5' }],
				'lg': ['1.125rem', { lineHeight: '1.5' }],
				'xl': ['1.25rem', { lineHeight: '1.5' }],
			},
		},
	},
	plugins: [],
}



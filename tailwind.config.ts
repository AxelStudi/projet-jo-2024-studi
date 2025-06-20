/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			colors: {
				primary: {
					blue: '#0066cc',
					red: '#ee334e',
					dark: '#121f3d',
				},
				gold: '#d4af37',
				olympic: {
					blue: '#0085C7',
					yellow: '#F4C300',
					black: '#000000',
					green: '#009F3D',
					red: '#DF0024',
				},
			},
			fontFamily: {
				sans: ['Montserrat', 'sans-serif'],
			},
			animation: {
				shine: 'shine 4s infinite linear',
			},
			keyframes: {
				shine: {
					'0%': { backgroundPosition: '100% 0' },
					'100%': { backgroundPosition: '-100% 0' },
				},
			},
		},
	},
	plugins: [],
};
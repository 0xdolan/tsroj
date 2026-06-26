/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{ts,js}"],
	theme: {
		extend: {
			fontFamily: {
				sans: ["Outfit", "system-ui", "sans-serif"],
				kurdish: ["Vazirmatn", "Outfit", "system-ui", "sans-serif"],
			},
			colors: {
				sky: {
					50: "#F0F9FF",
					100: "#E0F2FE",
					200: "#BAE6FD",
					300: "#7DD3FC",
					400: "#38BDF8",
					500: "#0EA5E9",
					600: "#0284C7",
					700: "#0369A1",
					800: "#075985",
					900: "#0C4A6E",
				},
			},
			boxShadow: {
				card: "0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 16px rgba(15, 23, 42, 0.06)",
			},
		},
	},
	plugins: [require("daisyui")],
	daisyui: {
		themes: [
			{
				tsroj: {
					primary: "#0EA5E9",
					"primary-content": "#FFFFFF",
					secondary: "#0369A1",
					"secondary-content": "#FFFFFF",
					accent: "#0284C7",
					"accent-content": "#FFFFFF",
					neutral: "#0F172A",
					"neutral-content": "#F8FAFC",
					"base-100": "#FFFFFF",
					"base-200": "#F0F9FF",
					"base-300": "#E0F2FE",
					"base-content": "#0F172A",
					info: "#38BDF8",
					success: "#10B981",
					warning: "#F59E0B",
					error: "#EF4444",
				},
			},
		],
	},
};

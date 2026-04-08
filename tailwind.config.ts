import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        foreground: "#f8fafc",
        accent: {
          DEFAULT: '#009ea8',
          light: '#e0f2f1',
          dark: '#007b83',
        },
        surface: "#141414",
        destructive: "#ef4444",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      fontSize: {
        // Hierarquía de títulos (4 niveles)
        'h1': ['2.5rem', { lineHeight: '1.2', fontWeight: '800', letterSpacing: '-0.02em' }],
        'h2': ['2.25rem', { lineHeight: '1.2', fontWeight: '700', letterSpacing: '-0.01em' }],
        'h3': ['1.5rem', { lineHeight: '1.3', fontWeight: '700' }],
        'h4': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        // Cuerpo de texto (2 niveles)
        'body-base': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.57', fontWeight: '400' }],
      },
    },
  },
  plugins: [],
};
export default config;

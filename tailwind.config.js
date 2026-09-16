// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // Add this if using src/
    "./node_modules/@shadcn/ui/**/*.{js,ts,jsx,tsx}", // Critical!
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // GreenEarthX brand scale — values live in src/app/styles/globals.css
        brand: {
          50: "var(--gex-green-50)",
          100: "var(--gex-green-100)",
          200: "var(--gex-green-200)",
          300: "var(--gex-green-300)",
          400: "var(--gex-green-400)",
          500: "var(--gex-green-500)",
          600: "var(--gex-green-600)",
          700: "var(--gex-green-700)",
          800: "var(--gex-green-800)",
          900: "var(--gex-green-900)",
          DEFAULT: "var(--gex-green-700)",
        },
        surface: {
          DEFAULT: "var(--gex-surface)",
          tint: "var(--gex-surface-tint)",
        },
      },
      ringColor: {
        brand: "var(--gex-ring)",
      },
      borderRadius: {
        "gex-sm": "var(--gex-radius-sm)",
        "gex-md": "var(--gex-radius-md)",
        "gex-lg": "var(--gex-radius-lg)",
      },
      boxShadow: {
        "gex-sm": "var(--gex-shadow-sm)",
        "gex-md": "var(--gex-shadow-md)",
        "gex-lg": "var(--gex-shadow-lg)",
      },
      transitionDuration: {
        DEFAULT: "150ms",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

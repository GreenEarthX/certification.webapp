// tailwind.plant-builder.config.ts
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/components/plant-builder/**/*.{ts,tsx}",
    "./src/app/plant-builder/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        layer: {
          equipment: "hsl(var(--layer-equipment))",
          "equipment-light": "hsl(var(--layer-equipment-light))",
          carrier: "hsl(var(--layer-carrier))",
          "carrier-light": "hsl(var(--layer-carrier-light))",
          gate: "hsl(var(--layer-gate))",
          "gate-light": "hsl(var(--layer-gate-light))",
        },
        canvas: {
          bg: "hsl(var(--canvas-bg))",
          grid: "hsl(var(--canvas-grid))",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
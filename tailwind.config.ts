import type { Config } from "tailwindcss";

// Renk kaynağı: Venti-Ate marka kitapçığı (Color Palette — primary colors)
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./content/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brown: {
          DEFAULT: "#56312D", // brandbook HEX 56312d
          dark: "#3A2019",
          darker: "#241310",
        },
        green: {
          DEFAULT: "#415D1F", // brandbook HEX 415d1f
          light: "#5C7A34",
        },
        cream: {
          DEFAULT: "#FFF6F0", // brandbook HEX fff6f0
        },
        peach: {
          DEFAULT: "#F9C89E", // brandbook HEX f9c89e
        },
        ink: "#241310",
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.25em",
      },
    },
  },
  plugins: [],
};
export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./content/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brown: {
          DEFAULT: "#56312D",
          dark: "#3A2019",
          darker: "#241310",
        },
        green: {
          DEFAULT: "#415D1F",
          light: "#5C7A34",
        },
        cream: {
          DEFAULT: "#FFF6F0",
        },
        peach: {
          DEFAULT: "#F9C89E",
        },
        ink: "#241310",
      },
      fontFamily: {
        display: ["Obviously Wide", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["Neue Haas Display", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.25em",
      },
    },
  },
  plugins: [],
};
export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Official ERAYA Green-Dominant Palette
        forest: {
          DEFAULT: "#173013", // Primary Forest Green
          dark: "#10250F",    // Deep Forest Green
          deep: "#0B1A0A",    // Deepest Botanical
          light: "#1F401A",
          950: "#091408",
          900: "#10250F",
          800: "#173013",
          700: "#20421B",
          600: "#295223",
          500: "#36682F",
        },
        botanical: {
          DEFAULT: "#29452B", // Secondary Botanical Green
          900: "#1A301C",
          800: "#223B24",
          700: "#29452B",
          600: "#345737",
          500: "#416C45",
          400: "#55875A",
        },
        cream: {
          DEFAULT: "#F8E9C5", // Official Logo Cream
          50: "#FEFCF7",
          100: "#FDF8EE",
          200: "#FAF1DF",
          300: "#F8E9C5",
          400: "#F1DAA2",
          500: "#E5C882",
          600: "#D3AF5F",
        },
        ivory: {
          DEFAULT: "#F5F1E7", // Warm Ivory
          50: "#FCFAF6",
          100: "#F8F5EE",
          200: "#F5F1E7",
          300: "#EBE4D5",
          400: "#DFD5C0",
        },
        gold: {
          DEFAULT: "#B49A70", // Antique Gold
          900: "#6B593C",
          800: "#836F4D",
          700: "#9C845F",
          600: "#B49A70",
          500: "#C4AD87",
          400: "#D4C2A1",
          300: "#E3D5BD",
        },
        sage: {
          DEFAULT: "#A6AD96", // Muted Sage
          900: "#4D5341",
          800: "#656C57",
          700: "#7F876F",
          600: "#949C83",
          500: "#A6AD96",
          400: "#B9BEAD",
          300: "#CCD0C4",
        },
        // Aliases kept only for the gold family
        champagne: {
          DEFAULT: "#B49A70",
        },
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "'Cormorant Garamond'", "Georgia", "serif"],
        sans: ["var(--font-dmsans)", "'DM Sans'", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(16, 37, 15, 0.12)",
        card: "0 10px 28px -12px rgba(11, 26, 10, 0.35)",
        elevated: "0 24px 48px -16px rgba(9, 20, 8, 0.45)",
      },
      keyframes: {
        bump: {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.35)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        bump: "bump 0.4s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;

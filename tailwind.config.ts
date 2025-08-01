import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/domains/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#0c2959",
          hover: "#0b2247",
        },
        secondary: {
          DEFAULT: "#566bda",
        },
        gray: {
          50: "#f8f9fb",
          100: "#f1f3f5", 
          200: "#E8ECEF",
          300: "#DEE2E6",
          400: "#CED4DA",
          500: "#ADB5BD",
          600: "#868e96",
          700: "#495057",
          800: "#343A40",
          900: "#212529",
        }
      },
      fontFamily: {
        sans: ["Pretendard", "sans-serif"],
        mono: ["Geist_Mono", "monospace"],
      },
      maxWidth: {
        container: "87.5rem", // 1400px
      },
      screens: {
        mobile: { max: "767px" },
        tablet: { max: "1023px" },
        desktop: "1024px",
      }
    },
  },
  plugins: [],
};

export default config;
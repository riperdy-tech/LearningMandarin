import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#17211f",
        jade: {
          50: "#eefcf7",
          100: "#d5f6ea",
          500: "#17a579",
          600: "#108061",
          900: "#083b31"
        },
        persimmon: {
          100: "#fff0dc",
          500: "#f28c38",
          600: "#d66b1c"
        },
        skyglass: "#e9f3ff",
        paper: "#fffaf1"
      },
      boxShadow: {
        soft: "0 16px 44px rgba(23, 33, 31, 0.10)",
        lift: "0 10px 24px rgba(23, 33, 31, 0.12)"
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "Segoe UI",
          "Arial",
          "sans-serif"
        ],
        han: [
          "Noto Sans TC",
          "Microsoft JhengHei",
          "PingFang TC",
          "sans-serif"
        ]
      }
    }
  },
  plugins: []
};

export default config;

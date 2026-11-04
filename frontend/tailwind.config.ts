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
        bizpro: {
          blue: "#2563EB",
          dark: "#0F172A",
          sidebar: "#0B132B",
          canvas: "#F8FAFC",
          card: "#FFFFFF",
        },
      },
    },
  },
  plugins: [],
};
export default config;

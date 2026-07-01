import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        mypal: {
          orange: "#f47b20",
          deep: "#1f2a44",
          ink: "#232323",
          cloud: "#f7f5f2",
          green: "#2f8f6b"
        }
      },
      boxShadow: {
        soft: "0 14px 40px rgba(31, 42, 68, 0.09)"
      }
    }
  },
  plugins: []
};

export default config;

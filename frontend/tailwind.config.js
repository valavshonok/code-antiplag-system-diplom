import customColors from "./src/config/colors.ts";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "data-theme",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ...customColors,
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],

};

/** @type {import('tailwindcss').Config} */

const fonts = require("./src/utils/fonts");
const colors = require("./src/utils/colors");

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
    "./node_modules/primevue/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      xs: "320px",
      tn: "428px",
      sm: "576px",
      md: "846px",
      lg: "1301px",
      xl: "1581px",
      xxl: "1921px",
      "2xl": "2440px",
    },
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "unset",
          },
        },
      },
      colors: colors,
      fontFamily: fonts,
    },
  },
  plugins: [],
};

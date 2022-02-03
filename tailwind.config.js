const colors = require("tailwindcss/colors");

module.exports = {
  content: ["./index.html", "./client-app/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      lato: ["Lato", "sans-serif"],
      roboto: ["Roboto", "sans-serif"],
      "roboto-condensed": ["Roboto Condensed", "sans-serif"],
    },
    extend: {
      colors: {
        // Generated with https://www.tailwindshades.com/
        yellow: {
          500: "#F0AD4E",
        },
        red: {
          500: "#FF4A4A",
        },
        cyan: {
          500: "#5294AD",
          700: "#00739E",
        },

        primary: {
          DEFAULT: "#F0AD4E",
        },
        secondary: {
          DEFAULT: "#151B1E",
        },
        focus: {
          DEFAULT: "#00739E",
        },

        info: "#292D3B",
        success: "#479048",
        warning: "#F0AD4E",
        danger: "#EC6A5E",
      },
    },
  },
  plugins: [require("@tailwindcss/line-clamp")],
};

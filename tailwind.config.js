/** @type {import('tailwindcss').Config} */
const { nextui, button } = require("@nextui-org/react");
const css = require('styled-jsx/css');

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        btn: {
          background: "hsl(var(--btn-background))",
          "background-hover": "hsl(var(--btn-background-hover))",
        },
      },
      borderWidth: {
        '.5': '.5px'
      },
    },
  },
  plugins: [nextui({
    layout: {
      radius: {
        small: ".25rem",
        medium: ".25rem",
        large: ".25rem"
      }
    }
  })
  ],
};

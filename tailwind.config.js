/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'ina-primary': '#014059',
        'ina-cyan': '#35C6F4',
        'ina-dark': '#012030',
        'ina-light': '#F0F8FC',
      }
    },
  },
  plugins: [],
}
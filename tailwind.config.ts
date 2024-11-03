/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        prime: {
          black: '#0A0A0A', // Deep black background
          gray: '#1C1C1C', // Soft black for cards/inputs
          gold: '#9E7E41', // Muted gold
        },
        text: {
          primary: '#FFFFFF', // Pure white
          secondary: '#9A9A9A', // Muted gray
        },
      },
      fontFamily: {
        display: ['var(--font-druk)'], // For logo and headings
        body: ['var(--font-space-grotesk)'], // For regular text
      },
    },
  },
  plugins: [],
};

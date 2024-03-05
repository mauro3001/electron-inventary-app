import animations from '@midudev/tailwind-animations'

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,js}',
    './src/ui/**/*.{html,js}'
  ],
  theme: {
    extend: {},
  },
  plugins: [animations],
}


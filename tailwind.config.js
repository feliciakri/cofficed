module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        fraunces: ['"Fraunces"'],
      },
      sun: {
        50: "#F1EBE5",
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};

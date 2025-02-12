/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        "bottom-strong": "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
      },
      colors: {
        zinc900: "#09090b",
      },
      scrollbar: {
        default: {
          thumb: "rgba(0, 0, 0, 0.2)",
          track: "transparent",
        },
        hover: {
          thumb: "rgba(0, 0, 0, 0.3)",
        },
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        ".scrollbar-thumb": {
          "background-color": "rgba(0, 0, 0, 0.2)",
          "border-radius": "10px",
        },
        ".scrollbar-thumb:hover": {
          "background-color": "rgba(0, 0, 0, 0.3)",
        },
        ".scrollbar-track": {
          "background-color": "transparent",
        },
        ".scrollbar-thin": {
          "scrollbar-width": "thin",
        },
      }
      addUtilities(newUtilities, ["responsive", "hover"])
    },
  ],
}

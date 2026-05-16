export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0e0c14",
        surface: "#130f1e",
        border: "#2a2040",
        primary: "#7c3aed",
        accent: "#a78bfa",
        muted: "#6b5f8a",
        body: "#e8e2f0",
      },
      borderRadius: {
        cm: "12px",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

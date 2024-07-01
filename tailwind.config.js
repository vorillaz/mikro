/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    colors: {
      "media-brand": "rgb(var(--media-brand) / <alpha-value>)",
      "media-focus": "rgb(var(--media-focus) / <alpha-value>)",
      transparent: "transparent",
      white: "#ffffff",
      black: "#000000",
      yellow: "#ffcc02",
      inner: "rgba(255, 204, 2, 0.2)",
      noop: "rgba(51, 51, 51, 0.5019607843)",
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@vidstack/react/tailwind.cjs")({
      prefix: "media",
    }),
    customVariants,
  ],
};

function customVariants({ addVariant, matchVariant }) {
  // Strict version of `.group` to help with nesting.
  matchVariant("parent-data", (value) => `.parent[data-${value}] > &`);

  addVariant("hocus", ["&:hover", "&:focus-visible"]);
  addVariant("group-hocus", [".group:hover &", ".group:focus-visible &"]);
}

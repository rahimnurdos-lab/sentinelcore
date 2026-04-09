/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Primary colors
        "primary": "#a5c8ff",
        "primary-container": "#004c8f",
        "primary-fixed": "#d4e3ff",
        "primary-fixed-dim": "#a5c8ff",
        "on-primary": "#00315f",
        "on-primary-container": "#93beff",
        "on-primary-fixed": "#001c3a",
        "on-primary-fixed-variant": "#004786",
        "inverse-primary": "#005faf",

        // Secondary colors (green/safe)
        "secondary": "#40e56c",
        "secondary-container": "#02c953",
        "secondary-fixed": "#69ff87",
        "secondary-fixed-dim": "#3ce36a",
        "on-secondary": "#003912",
        "on-secondary-container": "#004d1b",
        "on-secondary-fixed": "#002108",
        "on-secondary-fixed-variant": "#00531e",

        // Tertiary colors (orange/warning)
        "tertiary": "#ffb692",
        "tertiary-container": "#823400",
        "tertiary-fixed": "#ffdbcb",
        "tertiary-fixed-dim": "#ffb692",
        "on-tertiary": "#562000",
        "on-tertiary-container": "#ffa87c",
        "on-tertiary-fixed": "#341100",
        "on-tertiary-fixed-variant": "#7a3000",

        // Surface colors
        "surface": "#121416",
        "surface-dim": "#121416",
        "surface-bright": "#37393b",
        "surface-variant": "#333537",
        "surface-tint": "#a5c8ff",
        "surface-container": "#1e2022",
        "surface-container-low": "#1a1c1e",
        "surface-container-high": "#282a2c",
        "surface-container-highest": "#333537",
        "surface-container-lowest": "#0c0e10",

        // Background & text
        "background": "#121416",
        "on-background": "#e2e2e5",
        "on-surface": "#e2e2e5",
        "on-surface-variant": "#c3c6d4",
        "inverse-surface": "#e2e2e5",
        "inverse-on-surface": "#2f3133",

        // Outline
        "outline": "#8d909d",
        "outline-variant": "#434652",

        // Error
        "error": "#ffb4ab",
        "error-container": "#93000a",
        "on-error": "#690005",
        "on-error-container": "#ffdad6",
      },
      fontFamily: {
        "headline": ["Space Grotesk", "sans-serif"],
        "body": ["Manrope", "sans-serif"],
        "label": ["Manrope", "sans-serif"],
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem",
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "DM Sans", "sans-serif"],
        serif: ["Inter", "sans-serif"],
        mono: ['"Fira Code"', "monospace"],
      },
      colors: {
        background: "hsl(var(--color-background))",
        foreground: "hsl(var(--color-foreground))",
        card: "hsl(var(--color-card))",
        "card-foreground": "hsl(var(--color-card-foreground))",
        popover: "hsl(var(--color-popover))",
        "popover-foreground": "hsl(var(--color-popover-foreground))",
        primary: "hsl(var(--color-primary))",
        "primary-foreground": "hsl(var(--color-primary-foreground))",
        secondary: "hsl(var(--color-secondary))",
        "secondary-foreground": "hsl(var(--color-secondary-foreground))",
        tertiary: "hsl(var(--color-tertiary))",
        "tertiary-foreground": "hsl(var(--color-tertiary-foreground))",
        muted: "hsl(var(--color-muted))",
        "muted-foreground": "hsl(var(--color-muted-foreground))",
        accent: "hsl(var(--color-accent))",
        "accent-foreground": "hsl(var(--color-accent-foreground))",
        border: "hsl(var(--color-border))",
        input: "hsl(var(--color-input))",
        ring: "hsl(var(--color-ring))",
        success: "hsl(var(--color-success))",
        warning: "hsl(var(--color-warning))",
        navbar: "hsl(var(--color-navbar))",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, hsl(220, 20%, 10%), hsl(220, 20%, 18%))",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        marquee: "marquee 26s linear infinite",
        floaty: "floaty 6s ease-in-out infinite",
      },
      maxWidth: { content: "1280px" },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0c111d",
        slate: {
          ...colors.slate,
          DEFAULT: "#5d6678",
        },
        mint: "#12b981",
        coral: "#ff6b57",
        sky: "#38bdf8",
        cream: "#f7f4ef",
      },
      boxShadow: {
        soft: "0 20px 60px rgba(10, 16, 30, 0.12)",
        glow: "0 0 0 1px rgba(255,255,255,0.4), 0 20px 40px rgba(18,185,129,0.18)",
      },
      backgroundImage: {
        "mesh-warm": "radial-gradient(50% 50% at 8% 0%, rgba(56,189,248,.28), transparent 60%), radial-gradient(45% 45% at 92% 15%, rgba(255,107,87,.18), transparent 58%), radial-gradient(35% 35% at 50% 100%, rgba(18,185,129,.14), transparent 65%)",
      },
      keyframes: {
        revealUp: {
          "0%": { opacity: "0", transform: "translateY(16px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        floatSlow: {
          "0%,100%": { transform: "translate3d(0,0,0)" },
          "50%": { transform: "translate3d(0,-10px,0)" },
        },
        sweep: {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(120%)" },
        },
      },
      animation: {
        "reveal-up": "revealUp 620ms cubic-bezier(.22,.85,.23,1) both",
        "float-slow": "floatSlow 6s ease-in-out infinite",
        sweep: "sweep 2.2s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;

import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [reactRouter(), tailwindcss()],
  build: {
    outDir: "dist", // ensures Vite outputs here
    emptyOutDir: true, // clears previous builds
  },
});

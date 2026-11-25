import tailwindcss from "@tailwindcss/vite";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import devtoolsJson from "vite-plugin-devtools-json";

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    devtoolsJson(),
  ],
  resolve: {
    tsconfigPaths: true,
  },
});

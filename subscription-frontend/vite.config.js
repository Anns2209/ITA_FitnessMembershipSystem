import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "subscriptionApp",
      filename: "remoteEntry.js",
      exposes: {
        "./App": "./src/App.jsx",
      },
      shared: ["react", "react-dom"],
      dts: false,
    }),
  ],
  server: {
    port: 4175,
    origin: "http://localhost:4175",
  },
  preview: {
    port: 4175,
  },
  build: {
    target: "esnext",
  },
});

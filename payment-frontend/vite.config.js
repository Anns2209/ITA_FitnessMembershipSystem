import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "paymentApp",
      filename: "remoteEntry.js",
      exposes: {
        "./App": "./src/App.jsx",
      },
      shared: ["react", "react-dom"],
      dts: false,
    }),
  ],
  server: {
    port: 4176,
    origin: "http://localhost:4176",
  },
  preview: {
    port: 4176,
  },
  build: {
    target: "esnext",
  },
});

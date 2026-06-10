import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "frontendShell",
      remotes: {
        memberApp: {
          type: "module",
          name: "memberApp",
          entry: "http://localhost:4174/remoteEntry.js",
          entryGlobalName: "memberApp",
          shareScope: "default",
        },
        subscriptionApp: {
          type: "module",
          name: "subscriptionApp",
          entry: "http://localhost:4175/remoteEntry.js",
          entryGlobalName: "subscriptionApp",
          shareScope: "default",
        },
        paymentApp: {
          type: "module",
          name: "paymentApp",
          entry: "http://localhost:4176/remoteEntry.js",
          entryGlobalName: "paymentApp",
          shareScope: "default",
        },
      },
      filename: "remoteEntry.js",
      shared: ["react", "react-dom"],
      dts: false,
    }),
  ],
  server: {
    port: 4173,
    origin: "http://localhost:4173",
  },
  preview: {
    port: 4173,
  },
  build: {
    target: "esnext",
  },
});

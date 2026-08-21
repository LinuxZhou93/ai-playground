import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const modelGatewayProxy = {
  "/v1": {
    target: "http://127.0.0.1:4174",
    changeOrigin: true,
  },
};

export default defineConfig({
  base: process.env.XMP_PUBLIC_BASE || "/",
  build: {
    outDir: "dist/client",
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
    proxy: modelGatewayProxy,
  },
  preview: {
    host: "0.0.0.0",
    port: 4183,
    strictPort: true,
    proxy: modelGatewayProxy,
  },
  plugins: [react()],
});

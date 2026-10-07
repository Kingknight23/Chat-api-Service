import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");
    const useHttps = String(env.VITE_HTTPS || "false").toLowerCase() === "true";
    const httpsConfig = useHttps && env.VITE_HTTPS_KEY_PATH && env.VITE_HTTPS_CERT_PATH
        ? { key: fs.readFileSync(env.VITE_HTTPS_KEY_PATH), cert: fs.readFileSync(env.VITE_HTTPS_CERT_PATH) }
        : undefined;
    return {
        plugins: [react()],
        server: { https: httpsConfig }
    };
});

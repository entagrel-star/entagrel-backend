import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig(async () => {
  let componentTagger: any = () => ({});

  try {
    // Dynamic import wrapped inside async config function
    const mod = await import("lovable-tagger");
    componentTagger = mod.componentTagger;
  } catch (err) {
    console.warn("⚠️ Skipping lovable-tagger during build (not available in CJS mode)");
  }

  return {
    plugins: [react(), componentTagger()],
    build: {
      outDir: "dist",
      emptyOutDir: true,
    },
    resolve: {
      alias: {
        "@": "/src",
      },
    },
    server: {
      port: 5173,
      open: true,
    },
  };
});

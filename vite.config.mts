import { reactRouter } from "@react-router/dev/vite";
import path from "node:path";
import { defineConfig, transformWithEsbuild } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import babel from "vite-plugin-babel";
import istanbul from "vite-plugin-istanbul";

const port = process.env.PORT ?? 3000;

// Build ID for cache-busting locale JSON files
// Uses BUILD_ID env var from Docker build, commit SHA, or timestamp as fallback
const BUILD_ID = process.env.BUILD_ID ?? process.env.GIT_COMMIT ?? Date.now().toString();
const INSTRUMENTED_JS_FILE_PATTERN = /instrumented\/.*\.js$/;

export default defineConfig({
  define: {
    // Inject BUILD_ID as a global constant for runtime cache-busting
    __BUILD_ID__: JSON.stringify(BUILD_ID),
  },
  server: {
    // Use the same port as the Remix dev server.
    port: Number(port),
  },
  plugins: [
    babel({
      babelConfig: {
        presets: ["@babel/preset-react", "@babel/preset-typescript"],
        env: {
          test: {
            plugins: ["istanbul"],
          },
        },
      },
    }),
    istanbul({
      include: "app/**/*.{js,ts,jsx,tsx}",
      exclude: ["node_modules", "test/"],
      extension: [".js", ".ts", ".jsx", ".tsx"],
      cypress: true,
      requireEnv: false,
      forceBuildInstrument: true,
      nycrcPath: "./.nycrc",
    }),
    {
      name: "load+transform-js-files-as-jsx",
      async transform(code, id) {
        if (!INSTRUMENTED_JS_FILE_PATTERN.exec(id)) {
          return null;
        }

        // Use the exposed transform from vite, instead of directly
        // transforming with esbuild
        return transformWithEsbuild(code, id, {
          loader: "jsx",
          jsx: "automatic",
        });
      },
    },
    reactRouter(),
    tsconfigPaths(),
  ],
  optimizeDeps: {
    force: true,
    esbuildOptions: {
      loader: {
        ".js": "jsx",
      },
    },
  },
  ssr: {
    noExternal: ["react-idle-timer", "react-router", "react-router-dom"],
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, process.env.NODE_ENV === "test" ? "instrumented/" : "app/"),
      "@/fixtures/*": path.resolve(__dirname, "tests/cypress/fixtures/"),
      tests: path.resolve(__dirname, "tests/"),
      // React Router v7 doesn't have /server exports - redirect to main package
      "react-router-dom/server": "react-router",
      "react-router/server": "react-router",
    },
  },
  build: {
    sourcemap: process.env.NODE_ENV !== "production",
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress sourcemap warnings for node_modules
        if (warning.code === "SOURCEMAP_ERROR" && warning.message.includes("node_modules")) {
          return;
        }
        warn(warning);
      },
    },
  },
});

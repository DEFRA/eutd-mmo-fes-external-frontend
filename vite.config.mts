import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import path from "path";
import { defineConfig, transformWithEsbuild } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import babel from 'vite-plugin-babel';
import istanbul from 'vite-plugin-istanbul';

const port = process.env.PORT ?? 3000;

// This installs globals such as "fetch", "Response", "Request" and "Headers".
installGlobals();

export default defineConfig({
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
            plugins: ['istanbul'],
          },
        },
      },
    }),
    istanbul({
      include: 'app/**/*.{js,ts,jsx,tsx}',
      exclude: ['node_modules', 'test/'],
      extension: ['.js', '.ts', '.jsx', '.tsx'],
      cypress: true,
      requireEnv: false,
      forceBuildInstrument: true,
      nycrcPath: './.nycrc'
    }),
    {
      name: 'load+transform-js-files-as-jsx',
      async transform(code, id) {
        if (!id.match(/instrumented\/.*\.js$/)) {
          return null;
        }

        // Use the exposed transform from vite, instead of directly
        // transforming with esbuild
        return transformWithEsbuild(code, id, {
          loader: 'jsx',
          jsx: 'automatic',
        });
      },
    },
    remix({
      appDirectory: process.env.NODE_ENV === "test" ? "instrumented" : "app",
      ignoredRouteFiles: process.env.NODE_ENV === "test" ? ["**/.*", "**/*.test.{js,ts}"] : ["**/.*", "**/*.test.{js,ts}", "coverage.tsx"],
      buildDirectory: "build",
    }),
    tsconfigPaths(),
  ],
  optimizeDeps: {
    force: true,
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'app/'),
      "@/fixtures/*": path.resolve(__dirname, "tests/cypress/fixtures/"),
      'tests': path.resolve(__dirname, 'tests/'),
    },
  },
  build: {
    sourcemap: process.env.NODE_ENV !== "production"
  }
});

import { build } from "esbuild";

await build({
  entryPoints: ["index.ts"],
  outfile: "dist/index.js",
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node24",
  packages: "external",
  alias: {
    "@orbit/shared": "../../packages/shared/src/index.ts",
    "@orbit/i18n": "../../packages/i18n/src/index.ts",
  },
  sourcemap: true,
});

import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	base: "/tsroj/",
	resolve: {
		alias: {
			"@0xdolan/tsroj": path.resolve(root, "../src/index.ts"),
		},
	},
	build: {
		outDir: "dist",
		assetsDir: "assets",
		emptyOutDir: true,
	},
});

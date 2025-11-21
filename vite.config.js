import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@components": path.resolve(__dirname, "src/common/components"),
			"@hospital-components": path.resolve(__dirname, "src/modules/hospital/common"),
			"@utils": path.resolve(__dirname, "src/common/utils"),
			"@assets": path.resolve(__dirname, "src/assets"),
			"@hooks": path.resolve(__dirname, "src/common/hooks"),
			"@modules": path.resolve(__dirname, "src/modules"),
			"@": path.resolve(__dirname, "src"),

			"@tabler/icons-react": "@tabler/icons-react/dist/esm/icons/index.mjs",
		},
	},
});
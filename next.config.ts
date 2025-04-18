import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";
import path from "path";

const withSerwist = withSerwistInit({
	swSrc: "app/sw.ts",
	swDest: "public/sw.js",
	disable: process.env.NODE_ENV === "development",
	cacheOnNavigation: true,
	dontCacheBustURLsMatching:
		/^dist\/static\/([a-zA-Z0-9]+)\.([a-z0-9]+)\.(css|js)$/,
	exclude: [
		/\.map$/,
		/asset-manifest\.json$/,
		/LICENSE/,
		/README/,
		/robots.txt/,
	],
	reloadOnOnline: true,
});

const nextConfig: NextConfig = {
	poweredByHeader: false,
	compress: true,
	eslint: { ignoreDuringBuilds: true },
	webpack(config) {
    config.resolve.alias['@radix-ui/react-use-effect-event'] =
      path.resolve(__dirname, 'stubs/use-effect-event.js');
    return config;
  },
	experimental: {
		reactCompiler: true,
		nextScriptWorkers: true,
		viewTransition: true,
	},
};
export default withSerwist(nextConfig);

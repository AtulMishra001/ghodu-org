import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  images: {
    // Product photos uploaded from the admin panel.
    remotePatterns: [
      new URL(`https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME ?? "*"}/image/upload/**`),
    ],
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

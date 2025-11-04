/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
// import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: process.env.S3_BUCKET_PROTOCOL,
        hostname: process.env.S3_BUCKET_HOSTNAME,
        port: process.env.S3_BUCKET_PORT,
      },
    ],
  },
};

export default config;

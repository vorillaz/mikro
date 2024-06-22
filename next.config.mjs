import fs from "fs";
import path from "path";

const packageJson = JSON.parse(
  fs.readFileSync(path.resolve("./package.json"), "utf8")
);
const { version } = packageJson;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_VERSION: version,
    NEXT_PUBLIC_ENV: process.env.NODE_ENV,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: "export",
};

export default nextConfig;

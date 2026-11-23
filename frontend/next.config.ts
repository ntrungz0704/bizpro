import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: process.env.DOCKER_BUILD ? "standalone" : undefined,
  poweredByHeader: false,
};

export default nextConfig;

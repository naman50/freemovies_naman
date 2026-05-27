import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*","192.168.1.8:3000"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org"
      },
      {
        protocol: "https",
        hostname: "m.media-amazon.com"
      }
    ]
  }
};

export default nextConfig;

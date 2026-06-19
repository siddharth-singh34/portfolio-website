import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow the non-default quality used by the hero portrait (next/image).
    qualities: [75, 95],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  async headers() {
    return [
      {
        // Explicitly allow indexing on public pages.
        source: "/",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "index, follow",
          },
        ],
      },
      {
        // Explicitly allow indexing on all non-API routes.
        source: "/((?!api/).*)",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "index, follow",
          },
        ],
      },
      {
        source: "/tracking/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors *;",
          },
          {
            key: "X-Frame-Options",
            value: "ALLOWALL",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

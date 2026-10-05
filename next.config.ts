import type { NextConfig } from "next";

const isCodespaces = Boolean(
  process.env.CODESPACE_NAME &&
  process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN
);

const codespaceHost = isCodespaces
  ? `${process.env.CODESPACE_NAME}-3000.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`
  : undefined;

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [{ source: "/", destination: "/casamento", permanent: false }];
  },
  async rewrites() {
    return [
      {
        source: "/curriculo",
        destination: "https://dra-jessica-six.vercel.app/curriculo",
      },
      {
        source: "/curriculo/:path*",
        destination: "https://dra-jessica-six.vercel.app/curriculo/:path*",
      },
    ];
  },
  async headers() {
    const privateRoutes = [
      "/login", "/recuperar-senha", "/redefinir-senha",
      "/mfa/:path*", "/admin/:path*", "/auth/:path*", "/api/:path*",
    ];
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      ...privateRoutes.map((source) => ({
        source,
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      })),
      ...["/api/:path*", "/auth/:path*"].map((source) => ({
        source,
        headers: [{ key: "Cache-Control", value: "private, no-store, max-age=0" }],
      })),
    ];
  },
  ...(isCodespaces && codespaceHost
    ? {
        allowedDevOrigins: [codespaceHost],
        experimental: {
          serverActions: {
            allowedOrigins: [
              codespaceHost,
              "localhost:3000",
            ],
          },
        },
      }
    : {}),
};

export default nextConfig;

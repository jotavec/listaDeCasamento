import type { NextConfig } from "next";

const isCodespaces = Boolean(
  process.env.CODESPACE_NAME &&
  process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN
);

const codespaceHost = isCodespaces
  ? `${process.env.CODESPACE_NAME}-3000.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`
  : undefined;

const nextConfig: NextConfig = {
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

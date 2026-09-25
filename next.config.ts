import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      // logos de clientes vão como data URL (base64) direto no Server Action;
      // o padrão de 1MB é justo demais pra isso.
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;

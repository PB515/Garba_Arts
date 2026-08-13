import type { NextConfig } from "next";

// This template lives inside the IDP repo (which has its own lockfile for the
// tooling). Pin the workspace root to the template so Next doesn't infer the
// IDP root from multiple lockfiles. Harmless once cloned as a standalone site.
// `__dirname` is available because the config is evaluated as CommonJS.
const nextConfig: NextConfig = {
  turbopack: { root: __dirname },
  // Event banner uploads (decision #83) go through a server action, whose
  // default request-body limit (1MB) is too small for a real photo.
  experimental: {
    serverActions: {
      bodySizeLimit: '8mb',
    },
  },
};

export default nextConfig;

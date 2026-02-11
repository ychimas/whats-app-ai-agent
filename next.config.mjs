/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Silence Turbopack warning by explicitly enabling it (even with empty config)
  turbopack: {},
  serverExternalPackages: ["@whiskeysockets/baileys", "pino", "pino-pretty"],
  webpack: (config, { dev }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "fs": false,
      "net": false,
      "tls": false,
      "child_process": false,
      "readline": false,
    };
    
    if (dev) {
        config.watchOptions = {
            ...config.watchOptions,
            ignored: ['**/auth_info_baileys/**']
        }
    }
    
    return config;
  },
}

export default nextConfig

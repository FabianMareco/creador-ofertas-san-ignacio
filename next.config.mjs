/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.pexels.com', 'www.pexels.com'],
  },
  // Exclude @imgly from server-side bundling (browser-only library)
  serverExternalPackages: ['@imgly/background-removal'],
  webpack(config, { isServer }) {
    // Enable async WebAssembly for the client bundle
    if (!isServer) {
      config.experiments = { ...config.experiments, asyncWebAssembly: true };
    }
    // Treat binary model files as static assets, not JS
    config.module.rules.push({
      test: /\.(onnx|wasm|bin)$/,
      type: 'asset/resource',
    });
    return config;
  },
};

export default nextConfig;

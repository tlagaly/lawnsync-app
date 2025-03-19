/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['@radix-ui/react-label', '@radix-ui/react-select', '@radix-ui/react-tabs'],
  images: {
    domains: ['localhost', 'app.lawnsync.ai'],
  },
  postcss: true, // Enable PostCSS processing
  webpack: (config) => {
    // Ensure PostCSS loader is using our config file
    const rules = config.module.rules
      .find((rule) => typeof rule.oneOf === 'object')
      .oneOf.filter((rule) => Array.isArray(rule.use));

    rules.forEach((rule) => {
      const cssLoader = rule.use.find((use) => use?.loader?.includes('css-loader'));
      if (cssLoader) {
        cssLoader.options = {
          ...cssLoader.options,
          importLoaders: 1,
        };
      }
    });

    return config;
  }
}

module.exports = nextConfig

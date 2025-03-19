/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['@radix-ui/react-label', '@radix-ui/react-select', '@radix-ui/react-tabs'],
  images: {
    domains: ['localhost', 'app.lawnsync.ai'],
  },
  webpack: (config) => {
    // Ensure PostCSS loader is using our config file
    const rules = config.module.rules
      .find((rule) => typeof rule.oneOf === 'object')
      .oneOf.filter((rule) => Array.isArray(rule.use));

    rules.forEach((rule) => {
      const postCssLoader = rule.use?.find((use) => use?.loader?.includes('postcss-loader'));
      if (postCssLoader) {
        postCssLoader.options = {
          ...postCssLoader.options,
          postcssOptions: {
            config: true, // Use postcss.config.mjs
          },
        };
      }
    });

    return config;
  }
}

module.exports = nextConfig

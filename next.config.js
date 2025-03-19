/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['@radix-ui/react-label', '@radix-ui/react-select', '@radix-ui/react-tabs'],
  images: {
    domains: ['localhost'],
  },
  experimental: {
    optimizeCss: true,
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.css$/,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            importLoaders: 1,
            modules: {
              auto: true,
              localIdentName: '[local]_[hash:base64:5]',
            },
          },
        },
        {
          loader: 'postcss-loader',
          options: {
            postcssOptions: {
              config: true,
            },
          },
        },
      ],
    });
    return config;
  },
}

module.exports = nextConfig

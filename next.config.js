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
}

module.exports = nextConfig

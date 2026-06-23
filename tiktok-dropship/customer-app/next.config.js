/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['placehold.co', 'localhost'],
    unoptimized: true,
  },
};

module.exports = nextConfig;

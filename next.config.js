/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // disabling type checks in builds for hackathon
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;

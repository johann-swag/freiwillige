/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_ZITADEL_URL: process.env.NEXT_PUBLIC_ZITADEL_URL,
  },
}

module.exports = nextConfig

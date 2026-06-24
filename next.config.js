/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['replicate.delivery', 'pbxt.replicate.delivery'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-src 'self' https://www.helloasso.com; frame-ancestors 'self';",
          },
        ],
      },
    ]
  },
}
module.exports = nextConfig

import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const S3_BASE = 'https://photos.holylandphotos.org'

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'photos.holylandphotos.org',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/userfiles/:path*',
        destination: `${S3_BASE}/userfiles/:path*`,
        permanent: true,
      },
      {
        source: '/UserFiles/:path*',
        destination: `${S3_BASE}/userfiles/:path*`,
        permanent: true,
      },
    ]
  },
}

export default withPayload(nextConfig)

import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const S3_BASE = 'https://hlp-dev-photos-335804564725-us-east-2-an.s3.us-east-2.amazonaws.com'

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hlp-dev-photos-335804564725-us-east-2-an.s3.us-east-2.amazonaws.com',
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

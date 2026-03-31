import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hlp-dev-photos-335804564725-us-east-2-an.s3.us-east-2.amazonaws.com',
      },
    ],
  },
}

export default withPayload(nextConfig)

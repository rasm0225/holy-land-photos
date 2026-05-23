import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const S3_BASE = 'https://photos.holylandphotos.org'

const nextConfig = {
  images: {
    // Skip Next.js image optimization — let CloudFront serve the
    // photos.holylandphotos.org originals directly. The optimizer
    // was caching every requested size to /.next/cache/images/
    // and filling the EC2 disk (13 GB out of 20 GB on 2026-05-23
    // before this was set). CloudFront already caches the
    // originals with year-long Cache-Control headers, so the
    // EC2-side optimization buys us very little on a low-traffic
    // image-heavy site.
    unoptimized: true,
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

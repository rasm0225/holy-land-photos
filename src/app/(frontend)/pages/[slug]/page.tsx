import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound, redirect } from 'next/navigation'
import React from 'react'
import type { Metadata } from 'next'
import { RichText } from '@payloadcms/richtext-lexical/react'
import RecentAdditions from '../../components/RecentAdditions'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })

  const page = docs[0]
  if (!page) return { title: 'Not Found' }

  const htmlBody = (page as unknown as Record<string, unknown>).htmlBody as string | null
  const description = htmlBody
    ? htmlBody.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim().slice(0, 200)
    : `${page.title} — Holy Land Photos`

  return {
    title: page.title,
    description,
    openGraph: {
      title: `${page.title} — Holy Land Photos`,
      description,
      type: 'website',
    },
  }
}

export default async function StaticPage({ params, searchParams }: Props) {
  const { slug } = await params

  // Dynamic page handlers — slugs whose body is generated from live data
  // rather than the CMS-stored Lexical/HTML body.
  if (slug === 'recent-additions') {
    const sp = await searchParams
    const range = Array.isArray(sp.range) ? sp.range[0] : sp.range
    return <RecentAdditions range={range} />
  }

  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })

  const page = docs[0]
  if (!page) return notFound()

  // Handle redirects
  const redirectUrl = (page as unknown as Record<string, unknown>).redirectUrl as string | null
  if (redirectUrl) {
    redirect(redirectUrl)
  }

  const htmlBody = (page as unknown as Record<string, unknown>).htmlBody as string | null

  return (
    <div>
      <nav className="pln-crumbs" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span className="pln-sep">›</span>
        <span className="pln-current">{page.title}</span>
      </nav>

      <h1 className="pln-h1">{page.title}</h1>

      {page.body && <RichText data={page.body} />}
      {!page.body && htmlBody && (
        <div dangerouslySetInnerHTML={{ __html: htmlBody }} />
      )}
    </div>
  )
}

'use client'

import { usePathname } from 'next/navigation'

export function EditLink({ collection, id }: { collection?: string; id?: number | string }) {
  const pathname = usePathname()

  // If explicit collection/id passed, use directly
  if (collection && id) {
    return (
      <a
        href={`/admin/collections/${collection}/${id}`}
        style={{
          fontSize: '12px',
          color: '#999',
          textDecoration: 'none',
          marginLeft: '16px',
        }}
      >
        Edit
      </a>
    )
  }

  // Fallback: infer from URL (won't have ID, so use search)
  let adminUrl: string | null = null

  const browseMatch = pathname.match(/^\/browse\/([^/?]+)/)
  if (browseMatch) {
    adminUrl = `/admin/collections/sections?where%5Bslug%5D%5Bequals%5D=${browseMatch[1]}`
  }

  const photoMatch = pathname.match(/^\/photos\/([^/?]+)/)
  if (photoMatch) {
    adminUrl = `/admin/collections/photos?where%5BimageId%5D%5Bequals%5D=${photoMatch[1]}`
  }

  const pageMatch = pathname.match(/^\/pages\/([^/?]+)/)
  if (pageMatch) {
    adminUrl = `/admin/collections/pages?where%5Bslug%5D%5Bequals%5D=${pageMatch[1]}`
  }

  const newsMatch = pathname.match(/^\/news\/(\d+)/)
  if (newsMatch) {
    adminUrl = `/admin/collections/news/${newsMatch[1]}`
  }

  if (!adminUrl) return null

  return (
    <a
      href={adminUrl}
      style={{
        fontSize: '12px',
        color: '#999',
        textDecoration: 'none',
        marginLeft: '16px',
      }}
    >
      Edit
    </a>
  )
}

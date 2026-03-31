import { getPayload } from 'payload'
import config from '@payload-config'
import React from 'react'

export default async function HomePage() {
  const payload = await getPayload({ config })

  const { docs: topLevel } = await payload.find({
    collection: 'sections',
    where: {
      parent: { exists: false },
    },
    sort: 'title',
    limit: 0,
    depth: 0,
  })

  return (
    <div>
      <h1>Holy Land Photos</h1>
      <p>Biblical photography by Dr. Carl Rasmussen</p>

      <h2>Browse</h2>
      <ul>
        {topLevel.map((section) => (
          <li key={section.id}>
            <a href={`/browse/${section.slug}`}>{section.title}</a>
          </li>
        ))}
      </ul>
    </div>
  )
}

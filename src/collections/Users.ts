import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'name',
  },
  hooks: {
    // Record the client IP on each login so internal (admin) traffic can be
    // identified and excluded from Google Analytics. Only ever runs for the
    // handful of staff accounts — never for site visitors. Behind nginx the
    // real client IP arrives in X-Forwarded-For (first hop); fall back to
    // X-Real-IP. Wrapped so a capture failure can never block a login.
    afterLogin: [
      async ({ user, req }) => {
        try {
          const xff = req.headers.get('x-forwarded-for')
          const ip =
            (xff ? xff.split(',')[0]?.trim() : null) ||
            req.headers.get('x-real-ip') ||
            null
          if (!ip) return
          await req.payload.update({
            collection: 'users',
            id: user.id,
            data: { lastLoginIp: ip, lastLoginAt: new Date().toISOString() },
            req,
          })
        } catch {
          // Non-fatal: never let IP logging interfere with authentication.
        }
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      defaultValue: 'editor',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'lastLoginIp',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description:
          'Client IP recorded at last login. Use to exclude internal traffic in GA (Admin → Data Streams → Define internal traffic).',
      },
    },
    {
      name: 'lastLoginAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
}

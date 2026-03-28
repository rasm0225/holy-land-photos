import type { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Holy Land Photos',
  description: 'Biblical photography by Dr. Carl Rasmussen',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}

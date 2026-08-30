import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ReconFlow · P07',
  description: 'Explainable two-source sales reconciliation engine'
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

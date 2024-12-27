// src/app/layout.tsx
import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'

const cairo = Cairo({ subsets: ['arabic'] })

export const metadata: Metadata = {
  title: 'عقارات عُمان | الموقع الأول للعقارات في سلطنة عمان',
  description: 'ابحث عن عقارات للبيع والإيجار في سلطنة عمان',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={cairo.className}>
        {/* <Navbar /> */}
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
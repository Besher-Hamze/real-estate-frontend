// src/app/layout.tsx

"use client"
import { Cairo } from 'next/font/google'
import './globals.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastContainer } from 'react-toastify'

const cairo = Cairo({ subsets: ['arabic'] })

// export const metadata: Metadata = {
//   title: 'عقارات عُمان | الموقع الأول للعقارات في سلطنة عمان',
//   description: 'ابحث عن عقارات للبيع والإيجار في سلطنة عمان',
// }
const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={cairo.className}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
        <ToastContainer position="bottom-left" autoClose={2000} hideProgressBar={true} /> {/* Add ToastContainer here */}
      </body>
    </html>
  )
}
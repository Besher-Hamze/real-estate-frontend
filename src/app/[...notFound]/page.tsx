// app/[...notFound]/page.tsx
import { redirect } from 'next/navigation'

export default function CatchAll() {
  redirect('/')
}
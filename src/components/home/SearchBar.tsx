// src/components/home/SearchBar.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const SearchBar = () => {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/properties?q=${encodeURIComponent(searchQuery)}`)
  }

  return (
    <form onSubmit={handleSearch} className="w-full max-w-3xl">
      <div className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث عن موقع، نوع العقار، أو السعر..."
          className="flex-1 px-6 py-4 text-lg rounded-lg border-2 border-transparent focus:border-blue-500 outline-none"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
        >
          ابحث
        </button>
      </div>
    </form>
  )
}

export default SearchBar
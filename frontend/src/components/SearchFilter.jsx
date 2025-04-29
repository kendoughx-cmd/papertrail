import React, { useState, useEffect } from 'react'
import { MagnifyingGlass, X } from '@phosphor-icons/react'

const SearchFilter = ({ onSearch, onClear, placeholder = 'Search...' }) => {
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const timer = setTimeout(
      () => (searchTerm.trim() ? onSearch(searchTerm.trim()) : onClear()),
      300
    )
    return () => clearTimeout(timer)
  }, [searchTerm, onSearch, onClear])

  return (
    <div className="relative w-full max-w-md">
      <div className="relative flex items-center">
        <MagnifyingGlass
          size={20}
          color="#A0A0A0"
          className="absolute left-3 top-1/2 transform -translate-y-1/2"
        />
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 pl-10 pr-10 bg-[#1c1c1c] border border-[#333333] rounded-lg text-[#B0B0B0] focus:outline-none focus:border-[#FF9800]"
        />
        {searchTerm && (
          <>
            <button
              onClick={() => {
                setSearchTerm('')
                onClear()
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#A0A0A0] hover:text-[#FF9800]"
            >
              <X size={18} />
            </button>
            <span className="absolute -bottom-5 left-0 text-xs text-[#A0A0A0]">
              {searchTerm && 'Searching across all months'}
            </span>
          </>
        )}
      </div>
    </div>
  )
}

export default SearchFilter

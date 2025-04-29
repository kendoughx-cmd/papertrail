import React from 'react'

const BackgroundLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
      <div className="w-full max-w-md text-white">{children}</div>
    </div>
  )
}

export default BackgroundLayout

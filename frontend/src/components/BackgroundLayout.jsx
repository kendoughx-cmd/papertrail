import React from 'react'

const BackgroundLayout = ({ children }) => {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar (Fixed Width) */}
      <div className="w-56 flex-shrink-0"></div>

      {/* Main Content with Scrolling */}
      <div className="flex-grow h-screen overflow-y-auto px-10 py-8">
        {children}
      </div>
    </div>
  )
}

export default BackgroundLayout

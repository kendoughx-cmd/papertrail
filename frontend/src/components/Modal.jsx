import React from 'react'

const Modal = ({ isOpen, onClose, onSubmit, children, title, buttonText }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-[#1a1a1a] p-6 rounded-lg w-96 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[#B0B0B0]">{title}</h2>
        </div>
        <form onSubmit={onSubmit}>
          {children}
          <div className="flex justify-between mt-4">
            {/* Cancel Button */}
            <button
              type="button"
              onClick={onClose}
              className="flex items-center px-4 py-2 border border-[#333333] text-[#B0B0B0] rounded-md hover:border-[#FF9800] hover:text-[#FF9800] transition-colors duration-300 whitespace-nowrap"
            >
              Cancel
            </button>

            {/* Submit Button with Minimalist Design */}
            <button
              type="submit"
              className="bg-transparent border-2 border-[#FF9800] text-[#FF9800] font-semibold py-2 px-6 rounded-md hover:bg-[#FF9800] hover:text-black transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#FF9800]"
            >
              {buttonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Modal

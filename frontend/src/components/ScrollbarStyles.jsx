const ScrollbarStyles = () => {
  return (
    <style>
      {`
        .custom-scrollbar::-webkit-scrollbar {
          height: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #777;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #999;
        }
      `}
    </style>
  )
}

export default ScrollbarStyles

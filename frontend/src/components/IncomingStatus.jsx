import React from 'react'

const statusOptions = [
  'Received',
  'Forwarded to ATL',
  'Returned to Agency',
  'Pending Review',
  'Filed',
]

const IncomingStatus = ({ value, onChange }) => {
  return (
    <select
      name="status"
      value={value}
      onChange={onChange}
      className="w-full p-2 border border-[#333333] rounded text-[#B0B0B0] bg-[#1a1a1a]"
    >
      <option value="" disabled className="text-[#555555]">
        Select Status
      </option>
      {statusOptions.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}

export default IncomingStatus

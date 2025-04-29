import React from 'react'

const Role = ({ formData, handleInputChange }) => {
  return (
    <div>
      <label className="block text-[#B0B0B0]" htmlFor="role">
        Role
      </label>
      <select
        id="role"
        name="role"
        value={formData.role}
        onChange={handleInputChange}
        className="w-full p-2 bg-transparent border border-[#333333] rounded text-[#B0B0B0] focus:border-[#FF9800] focus:ring-0 focus:outline-none shadow-sm"
        autoComplete="off"
      >
        <option value="" disabled className="bg-[#1a1a1a] text-[#B0B0B0]">
          Select a role...
        </option>
        <option value="Admin" className="bg-[#1a1a1a] text-[#B0B0B0]">
          Admin
        </option>
        <option
          value="Audit Team Leader"
          className="bg-[#1a1a1a] text-[#B0B0B0]"
        >
          Audit Team Leader
        </option>
        <option
          value="Audit Team Member"
          className="bg-[#1a1a1a] text-[#B0B0B0]"
        >
          Audit Team Member
        </option>
        <option value="Staff" className="bg-[#1a1a1a] text-[#B0B0B0]">
          Staff
        </option>
        <option value="Intern" className="bg-[#1a1a1a] text-[#B0B0B0]">
          Intern
        </option>
      </select>
    </div>
  )
}

export default Role

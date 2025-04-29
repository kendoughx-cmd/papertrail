import React, { useState, useRef, useEffect } from 'react'

const agencyGroups = [
  {
    groupName: 'Satellite Campuses',
    options: [
      'USTP - Jasaan',
      'USTP - Balubal',
      'USTP - Panaon',
      'USTP - Oroquieta',
    ],
  },
  {
    groupName: 'Major Campuses',
    options: ['USTP - CDO', 'USTP - Claveria', 'USTP - Villanueva'],
  },
  {
    groupName: 'Main Campus',
    options: ['USTP - Alubijid'],
  },
  {
    groupName: 'Other Campuses',
    options: ['CPSC'],
  },
]

const AgencyDropdown = ({ value, onChange, disabled = false }) => {
  const [isOthersSelected, setIsOthersSelected] = useState(false)
  const [othersValue, setOthersValue] = useState('')
  const inputRef = useRef(null)
  const selectRef = useRef(null)

  useEffect(() => {
    // Check if current value is not in any predefined options
    const isCustomValue =
      value && !agencyGroups.some((group) => group.options.includes(value))

    if (isCustomValue) {
      setIsOthersSelected(true)
      setOthersValue(value)
    }
  }, [value])

  const handleSelectChange = (e) => {
    const selectedValue = e.target.value

    if (selectedValue === 'Others') {
      setIsOthersSelected(true)
      setOthersValue('')
      setTimeout(() => inputRef.current?.focus(), 0)
    } else {
      setIsOthersSelected(false)
      onChange(e)
    }
  }

  const handleInputChange = (e) => {
    const newValue = e.target.value
    setOthersValue(newValue)
    onChange({ target: { name: 'agency', value: newValue } })
  }

  const handleInputBlur = () => {
    if (!othersValue) {
      setIsOthersSelected(false)
      selectRef.current.value = ''
    }
  }

  return (
    <div className="relative">
      <select
        ref={selectRef}
        name="agency"
        value={isOthersSelected ? 'Others' : value}
        onChange={handleSelectChange}
        disabled={disabled}
        className="w-full p-2 border border-[#333333] rounded text-[#B0B0B0] bg-[#1a1a1a]"
      >
        <option value="" disabled>
          Select Agency
        </option>
        {agencyGroups.map((group, groupIndex) => (
          <optgroup
            key={groupIndex}
            label={group.groupName}
            className="bg-[#1a1a1a] text-[#B0B0B0]"
          >
            {group.options.map((option, optionIndex) => (
              <option
                key={`${groupIndex}-${optionIndex}`}
                value={option}
                className="hover:bg-[#2a2a2a]"
              >
                {option}
              </option>
            ))}
          </optgroup>
        ))}
        {/* Add the "Others" option explicitly to the dropdown */}
        <option value="Others">Others</option>
      </select>

      {/* Show input field when 'Others' is selected */}
      {isOthersSelected && (
        <input
          ref={inputRef}
          type="text"
          value={othersValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder="Type other agency"
          className="absolute inset-0 w-full p-2 border border-[#333333] rounded text-[#B0B0B0] bg-[#1a1a1a]"
          style={{
            zIndex: 10,
            paddingLeft: '2.5rem', // Adjust based on your design
          }}
        />
      )}
    </div>
  )
}

export default AgencyDropdown

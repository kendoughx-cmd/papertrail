import React, { useState, useRef, useEffect } from 'react';

const OutgoingDocumentTypes = ({
  value = '',
  onChange,
  name = 'documentType',
  disabled = false,
  isFilter = false,
}) => {
  const documentTypes = React.useMemo(
    () => [
      'AOM Release',
      'Notice of Suspension',
      'Notice of Disallowance',
      'Notice of Charge',      // Added from SQL query
      'Answer to Appeal',      // Added from SQL query
      'Answer to Complaints',  // Added from SQL query
      'Compliance with Ombudsman',  // Added from SQL query
      'Auditor Rejoinder',     // Added from SQL query
      'Audit Query',           // Added from SQL query
      'Request for Relief Answer', // Added from SQL query
    ],
    []
  );

  const [isOthersSelected, setIsOthersSelected] = useState(false);
  const [othersValue, setOthersValue] = useState('');
  const inputRef = useRef(null);
  const selectRef = useRef(null);

  useEffect(() => {
    const isCustomValue = value && !documentTypes.includes(value);
    if (
      isCustomValue &&
      typeof value === 'string' &&
      value.startsWith('Others: ')
    ) {
      setIsOthersSelected(true);
      setOthersValue(value.replace('Others: ', ''));
    } else {
      setIsOthersSelected(false);
      setOthersValue('');
    }
  }, [value, documentTypes]);

  const handleSelectChange = (e) => {
    const selectedValue = e.target.value;
    if (selectedValue === 'Others') {
      setIsOthersSelected(true);
      setOthersValue('');
      setTimeout(() => inputRef.current?.focus(), 0);
      if (isFilter) {
        onChange('Others');
      } else {
        onChange({
          target: {
            name,
            value: 'Others',
          },
        });
      }
    } else {
      setIsOthersSelected(false);
      setOthersValue('');
      if (isFilter) {
        onChange(selectedValue);
      } else {
        onChange(e);
      }
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setOthersValue(newValue);
    if (isFilter) {
      onChange(newValue ? `Others: ${newValue}` : 'Others');
    } else {
      onChange({
        target: {
          name,
          value: newValue ? `Others: ${newValue}` : 'Others',
        },
      });
    }
  };

  const handleInputBlur = () => {
    if (!othersValue.trim()) {
      setIsOthersSelected(false);
      setOthersValue('');
      if (selectRef.current) {
        selectRef.current.value = '';
      }
      if (isFilter) {
        onChange('');
      } else {
        onChange({
          target: {
            name,
            value: '',
          },
        });
      }
    }
  };

  return (
    <div className="relative">
      <select
        ref={selectRef}
        name={name}
        value={isOthersSelected ? 'Others' : value}
        onChange={handleSelectChange}
        disabled={disabled}
        className={`w-full p-2 border border-[#333333] rounded text-[#B0B0B0] bg-[#1a1a1a] focus:outline-none focus:border-white ${
          disabled ? 'opacity-70 cursor-not-allowed' : ''
        }`}
      >
        <option value="" disabled className="bg-[#1a1a1a] text-[#666666]">
          Select Document Type
        </option>
        {documentTypes.map((type) => (
          <option
            key={type}
            value={type}
            className="bg-[#1a1a1a] hover:bg-[#2a2a2a]"
          >
            {type}
          </option>
        ))}
        <option value="Others" className="bg-[#1a1a1a] hover:bg-[#2a2a2a]">
          Others
        </option>
      </select>

      {isOthersSelected && (
        <div className="absolute inset-0 flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={othersValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            placeholder="Specify document type"
            className={`w-full h-full pl-2 pr-20 border border-[#333333] rounded text-[#B0B0B0] bg-[#1a1a1a] focus:outline-none focus:border-white ${
              disabled ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            style={{
              zIndex: 10,
            }}
            disabled={disabled}
          />
          <span className="absolute right-3 text-[#B0B0B0] text-sm font-normal">
            Others:
          </span>
        </div>
      )}
    </div>
  );
};

export default OutgoingDocumentTypes;

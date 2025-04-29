import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  CaretLeft,
  CaretRight,
  Pencil,
  Trash,
  Plus,
  Minus,
} from '@phosphor-icons/react'
import Sidebar from '../components/Sidebar'
import Modal from '../components/Modal'
import OutgoingDocumentTypes from '../components/OutgoingDocumentTypes'
import ScrollbarStyles from '../components/ScrollbarStyles'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import OutgoingStatus from '../components/OutgoingStatus'
import AgencyDropdown from '../components/AgencyDropdown'
import ExportPDFButton from '../components/ExportPDFButton'
import SearchFilter from '../components/SearchFilter'
import {
  formatTitleCase,
  getMonthName,
  formatCurrency,
  isEmpty,
} from '../utils/helpers'
import { logAction, trackChanges } from '../utils/logging'

const tableHeaders = [
  'Control No.',
  'Date Released',
  'Description',
  'Particulars',
  'Qty',
  'Amount',
  'Total Amount',
  'Agency',
  'Status',
  'Received By',
  'Storage File',
  'Actions',
]

const initialFormData = {
  id: '',
  controlNo: '',
  dateReleased: '',
  documentType: 'AOM Release',
  description: '',
  particulars: [{ item: '', quantity: '', amount: '' }],
  agency: '',
  status: '',
  receivedBy: '',
  storageFile: '',
}

const Outgoing = () => {
  const [outgoingData, setOutgoingData] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [currentMonthYear, setCurrentMonthYear] = useState(null)
  const [availableMonths, setAvailableMonths] = useState([])
  const [filterDocumentType, setFilterDocumentType] = useState('AOM Release')
  const [formData, setFormData] = useState(initialFormData)
  const [formErrors, setFormErrors] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRows, setSelectedRows] = useState([])
  const itemsPerPage = 5

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return null

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/get-user-profile.php`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) {
          return {
            first_name: data.user.first_name || '-',
            last_name: data.user.last_name || '',
          }
        }
      }
      return { first_name: '-', last_name: '' }
    } catch (error) {
      console.error('Error fetching user data:', error)
      return { first_name: '-', last_name: '' }
    }
  }

  useEffect(() => {
    const fetchOutgoingData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/get-outgoing.php`
        )
        const data = await response.json()
        setOutgoingData(data)
        const months = [
          ...new Set(
            data.map((item) => item.controlNo?.split('-').slice(0, 2).join('-'))
          ),
        ]
          .filter(Boolean)
          .sort((a, b) => b.localeCompare(a))
        setAvailableMonths(months)
        setCurrentMonthYear(months[0] || null)
      } catch (error) {
        console.error('Error:', error)
        toast.error('Failed to load data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchOutgoingData()
  }, [])

  const validateForm = () => {
    const errors = {}
    if (!formData.documentType) errors.documentType = 'Required'
    if (formData.particulars.some((p) => !p.item))
      errors.particulars = 'All items need description'
    setFormErrors(errors)
    return !Object.keys(errors).length
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (formErrors[name])
      setFormErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleParticularChange = (index, e) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const newParticulars = [...prev.particulars]
      newParticulars[index] = {
        ...newParticulars[index],
        [name]: ['quantity', 'amount'].includes(name)
          ? value === ''
            ? ''
            : Number(value)
          : value,
      }
      return { ...prev, particulars: newParticulars }
    })
  }

  const addParticular = () =>
    setFormData((prev) => ({
      ...prev,
      particulars: [
        ...prev.particulars,
        { item: '', quantity: '', amount: '' },
      ],
    }))

  const removeParticular = (index) =>
    formData.particulars.length > 1 &&
    setFormData((prev) => ({
      ...prev,
      particulars: prev.particulars.filter((_, i) => i !== index),
    }))

  const calculateTotal = useCallback(
    () =>
      formData.particulars.reduce(
        (total, { quantity = 0, amount = 0 }) =>
          total + (quantity || 0) * (amount || 0),
        0
      ),
    [formData.particulars]
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return toast.error('Please fill required fields')

    try {
      const currentUser = await fetchCurrentUser()
      const action = isEditMode ? 'UPDATE' : 'CREATE'
      const originalData = isEditMode
        ? outgoingData.find((item) => item.id === formData.id)
        : null

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/${
          isEditMode ? 'update' : 'add'
        }-outgoing.php`,
        {
          method: isEditMode ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: formData.id || '',
            documentType: formData.documentType || '',
            description: formData.description || '',
            items: formData.particulars.map((p) => p.item || ''),
            quantities: formData.particulars.map(
              (p) => Number(p.quantity) || 0
            ),
            amounts: formData.particulars.map((p) => Number(p.amount) || 0),
            agency: formData.agency || '',
            status: formData.status || '',
            receivedBy: formData.receivedBy || '',
            storageFile: formData.storageFile || '',
            totalAmount: calculateTotal(),
          }),
        }
      )

      if (!response.ok) throw new Error('Request failed')
      const result = await response.json()

      if (result.success) {
        toast.success(isEditMode ? 'Updated!' : 'Added!')

        // Log the action with current user
        const changes = isEditMode ? trackChanges(originalData, formData) : null
        await logAction(
          action,
          formData.documentType,
          result.controlNo || formData.controlNo,
          currentUser,
          { changes }
        )

        const refreshResponse = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/get-outgoing.php`
        )
        setOutgoingData(await refreshResponse.json())
        resetForm()
      } else throw new Error(result.message || 'Error occurred')
    } catch (error) {
      console.error('Error:', error)
      toast.error(error.message || 'Request failed')
    }
  }

  const resetForm = () => {
    setIsModalOpen(false)
    setIsEditMode(false)
    setFormData(initialFormData)
    setFormErrors({})
  }

  const handleEdit = (item) => {
    setFormData({
      ...item,
      id: item.id || '',
      particulars: (Array.isArray(item.particulars)
        ? item.particulars
        : []
      ).map((p, i) => ({
        item: p || '',
        quantity: item.qty?.[i] || '',
        amount: item.amount?.[i] || '',
      })) || [{ item: '', quantity: '', amount: '' }],
    })
    setIsModalOpen(true)
    setIsEditMode(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this document?')) {
      try {
        const currentUser = await fetchCurrentUser()
        const documentToDelete = outgoingData.find((item) => item.id === id)

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/delete-outgoing.php`,
          {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
          }
        )
        if (!response.ok) throw new Error('Delete failed')
        const result = await response.json()

        if (result.success) {
          toast.success('Deleted!')

          // Log the deletion with current user
          await logAction(
            'DELETE',
            documentToDelete.documentType,
            documentToDelete.controlNo,
            currentUser
          )

          const refreshResponse = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/get-outgoing.php`
          )
          setOutgoingData(await refreshResponse.json())
          setSelectedRows((prev) => prev.filter((rowId) => rowId !== id))
        } else throw new Error(result.message || 'Delete failed')
      } catch (error) {
        console.error('Error:', error)
        toast.error(error.message || 'Delete failed')
      }
    }
  }

  const handleMonthNavigation = (direction) => {
    const currentIndex = availableMonths.indexOf(currentMonthYear)
    const newIndex = direction === 'prev' ? currentIndex + 1 : currentIndex - 1
    if (newIndex >= 0 && newIndex < availableMonths.length) {
      setCurrentMonthYear(availableMonths[newIndex])
      setCurrentPage(1)
    }
  }

  const filteredData = useMemo(() => {
    const typeFiltered = outgoingData.filter(
      (item) => !filterDocumentType || item.documentType === filterDocumentType
    )
    if (!search)
      return typeFiltered.filter(
        (item) =>
          !currentMonthYear || item.controlNo?.startsWith(currentMonthYear)
      )

    const searchTerms = search
      .toLowerCase()
      .split(' ')
      .filter((term) => term)
    return typeFiltered.filter((item) => {
      const searchString = `
        ${item.controlNo || ''} ${item.dateReleased || ''}
        ${item.description || ''} ${
        Array.isArray(item.particulars) ? item.particulars.join(' ') : ''
      }
        ${Array.isArray(item.qty) ? item.qty.join(' ') : item.qty || ''}
        ${
          Array.isArray(item.amount) ? item.amount.join(' ') : item.amount || ''
        }
        ${item.totalAmount || ''} ${item.agency || ''} ${item.status || ''} 
        ${item.receivedBy || ''} ${item.storageFile || ''}
      `.toLowerCase()
      return searchTerms.every((term) => searchString.includes(term))
    })
  }, [outgoingData, currentMonthYear, filterDocumentType, search])

  const currentItems = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage
    return filteredData.slice(indexOfLastItem - itemsPerPage, indexOfLastItem)
  }, [filteredData, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const [year, month] = currentMonthYear?.split('-') || []
  const displayMonthYear = currentMonthYear
    ? `${getMonthName(+month)} ${year}`
    : 'Select month'

  const renderCellContent = (
    value,
    formatFn = (v) => v,
    isCurrency = false
  ) => {
    if (isEmpty(value) || value === 0) return '-'
    if (Array.isArray(value)) {
      const filtered = value.filter((v) => !isEmpty(v) && v !== 0)
      return filtered.length ? (
        <ul className="list-disc pl-4">
          {filtered.map((v, i) => (
            <li key={i}>{isCurrency ? formatCurrency(v) : formatFn(v)}</li>
          ))}
        </ul>
      ) : (
        '-'
      )
    }
    return isCurrency ? formatCurrency(value) : formatFn(value)
  }

  const handleRowSelection = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    )
  }

  const handleSelectAllRows = () => {
    if (selectedRows.length === currentItems.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(currentItems.map((item) => item.id))
    }
  }

  if (isLoading)
    return (
      <div className="flex h-screen bg-[#1a1a1a] text-[#B0B0B0]">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF9800] mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    )

  return (
    <div className="flex h-screen bg-[#1a1a1a] text-[#B0B0B0] overflow-hidden">
      <Sidebar />
      <ToastContainer position="top-right" autoClose={5000} theme="dark" />

      <div className="flex-1 overflow-y-auto p-6 h-screen custom-scrollbar">
        <h1 className="text-2xl font-semibold mb-2 text-[#FF9800]">Outgoing</h1>
        <p className="text-[#B0B0B0] mb-4">Manage outgoing documents</p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleMonthNavigation('prev')}
              disabled={
                availableMonths.indexOf(currentMonthYear) >=
                availableMonths.length - 1
              }
              className="p-2 rounded-lg disabled:text-[#555555] text-[#FF9800] hover:bg-[#333333]"
            >
              <CaretLeft size={20} />
            </button>
            <h2 className="text-xl font-medium text-[#FF9800]">
              {displayMonthYear}
            </h2>
            <button
              onClick={() => handleMonthNavigation('next')}
              disabled={availableMonths.indexOf(currentMonthYear) <= 0}
              className="p-2 rounded-lg disabled:text-[#555555] text-[#FF9800] hover:bg-[#333333]"
            >
              <CaretRight size={20} />
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-3">
            <SearchFilter
              onSearch={(term) => {
                setSearch(term)
                setCurrentPage(1)
              }}
              onClear={() => setSearch('')}
            />
            <div className="w-56">
              <OutgoingDocumentTypes
                value={filterDocumentType}
                onChange={(value) => {
                  setFilterDocumentType(value)
                  setCurrentPage(1)
                }}
                isFilter={true}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <ExportPDFButton
              data={filteredData}
              selectedRows={selectedRows}
              columns={tableHeaders.filter(
                (col) => col !== 'Actions' && col !== 'Select'
              )}
              fileName="Outgoing_Documents"
              currentFilter={{
                documentType: filterDocumentType,
                monthYear: displayMonthYear,
                searchTerm: search,
              }}
              includeDate={true}
            />
            <button
              onClick={() => {
                setIsModalOpen(true)
                setIsEditMode(false)
              }}
              className="bg-transparent border-2 border-[#FF9800] text-[#FF9800] font-semibold py-1.5 px-4 rounded-md hover:bg-[#FF9800] hover:text-black"
            >
              Add Outgoing
            </button>
          </div>
        </div>

        <div className="border border-[#333333] rounded-lg p-3 overflow-x-auto custom-scrollbar shadow-lg">
          <table className="w-full text-left text-sm min-w-max">
            <thead className="text-[#D0D0D0] border-b border-[#333333]">
              <tr>
                <th className="py-3 px-3 w-8">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={
                        selectedRows.length > 0 &&
                        currentItems.every((item) =>
                          selectedRows.includes(item.id)
                        )
                      }
                      onChange={handleSelectAllRows}
                      className="h-4 w-4 rounded border border-[#555555] bg-[#1a1a1a] text-[#FF9800] focus:ring-1 focus:ring-[#FF9800] focus:ring-offset-0 cursor-pointer appearance-none hover:border-[#777777] checked:bg-[#1a1a1a] checked:border-[#FF9800]"
                    />
                  </div>
                </th>
                {tableHeaders.map((header) => (
                  <th key={header} className="py-3 px-3">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentItems.length ? (
                currentItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-[#333333] hover:bg-[#222222]"
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(item.id)}
                          onChange={() => handleRowSelection(item.id)}
                          className="h-4 w-4 rounded border border-[#555555] bg-[#1a1a1a] text-[#FF9800] focus:ring-1 focus:ring-[#FF9800] focus:ring-offset-0 cursor-pointer appearance-none hover:border-[#777777] checked:bg-[#1a1a1a] checked:border-[#FF9800]"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      {renderCellContent(item.controlNo)}
                    </td>
                    <td className="py-3 px-3">
                      {renderCellContent(item.dateReleased)}
                    </td>
                    <td className="py-3 px-3">
                      {renderCellContent(item.description, formatTitleCase)}
                    </td>
                    <td className="py-3 px-3">
                      {renderCellContent(item.particulars, formatTitleCase)}
                    </td>
                    <td className="py-3 px-3">{renderCellContent(item.qty)}</td>
                    <td className="py-3 px-3">
                      {renderCellContent(item.amount, null, true)}
                    </td>
                    <td className="py-3 px-3">
                      {item.totalAmount === 0 || isEmpty(item.totalAmount) ? (
                        '-'
                      ) : (
                        <span className="font-semibold text-yellow-400">
                          {formatCurrency(item.totalAmount)}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {renderCellContent(item.agency)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`${
                          !item.status
                            ? 'text-[#B0B0B0]'
                            : item.status === 'Returned to Claveria'
                            ? 'text-yellow-400'
                            : item.status === 'Returned to CPSC'
                            ? 'text-green-400'
                            : item.status === 'Returned to Cagayan De Oro'
                        } font-medium`}
                      >
                        {renderCellContent(item.status)}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {renderCellContent(item.receivedBy, formatTitleCase)}
                    </td>
                    <td className="py-3 px-3">
                      {renderCellContent(item.storageFile)}
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-[#4A90E2] hover:text-[#2C73B7]"
                      >
                        <Pencil size={20} color="#4A90E2" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-[#D0021B] hover:text-[#B42A2A] ml-2"
                      >
                        <Trash size={20} color="#D0021B" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={tableHeaders.length + 1}
                    className="text-center py-4 text-[#A0A0A0]"
                  >
                    {search
                      ? 'No matches'
                      : filterDocumentType
                      ? `No ${filterDocumentType} for ${displayMonthYear}`
                      : `No documents for ${displayMonthYear}`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#333333] disabled:text-[#555555] text-[#A0A0A0] hover:bg-[#333333]"
          >
            <CaretLeft size={18} /> Prev
          </button>
          <div className="text-[#A0A0A0]">
            Page {currentPage} of {totalPages || 1}
          </div>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages || totalPages === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#333333] disabled:text-[#555555] text-[#A0A0A0] hover:bg-[#333333]"
          >
            Next <CaretRight size={18} />
          </button>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        onSubmit={handleSubmit}
        title={isEditMode ? 'Edit Document' : 'Add Document'}
        buttonText={isEditMode ? 'Update' : 'Add'}
      >
        <div className="space-y-3">
          <div>
            <label className="block text-[#B0B0B0] mb-1">Document Type *</label>
            <OutgoingDocumentTypes
              value={formData.documentType}
              onChange={handleInputChange}
              name="documentType"
            />
            {formErrors.documentType && (
              <p className="text-red-400 text-xs mt-1">
                {formErrors.documentType}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[#B0B0B0] mb-1">Description</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-2 bg-transparent border border-[#333333] rounded text-[#B0B0B0]"
            />
          </div>

          <div>
            <label className="block text-[#B0B0B0] mb-1">Received By</label>
            <input
              type="text"
              name="receivedBy"
              value={formData.receivedBy}
              onChange={handleInputChange}
              className="w-full p-2 bg-transparent border border-[#333333] rounded text-[#B0B0B0]"
            />
          </div>

          <div>
            <label className="block text-[#B0B0B0] mb-1">Agency</label>
            <AgencyDropdown
              value={formData.agency}
              onChange={handleInputChange}
              name="agency"
            />
          </div>

          <div>
            <label className="block text-[#B0B0B0] mb-1">Status</label>
            <OutgoingStatus
              value={formData.status}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="block text-[#B0B0B0] mb-1">Storage File</label>
            <input
              type="text"
              name="storageFile"
              value={formData.storageFile}
              onChange={handleInputChange}
              className="w-full p-2 bg-transparent border border-[#333333] rounded text-[#B0B0B0]"
            />
          </div>

          <div>
            <label className="block text-[#B0B0B0] mb-1">Particulars *</label>
            {formErrors.particulars && (
              <p className="text-red-400 text-xs mb-1">
                {formErrors.particulars}
              </p>
            )}
            <div className="space-y-2">
              {formData.particulars.map((item, i) => (
                <div
                  key={i}
                  className="bg-[#1e1e1e] p-2 rounded-lg border border-[#333333]"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      name="item"
                      value={item.item}
                      onChange={(e) => handleParticularChange(i, e)}
                      placeholder="Item name"
                      className="flex-1 p-1.5 bg-[#1c1c1c] border border-[#333333] rounded text-[#B0B0B0]"
                    />
                    {formData.particulars.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeParticular(i)}
                        className="p-1.5 text-[#A0A0A0] hover:text-[#D0021B]"
                      >
                        <Minus size={14} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-[#A0A0A0] mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        value={item.quantity}
                        min="0"
                        onChange={(e) => handleParticularChange(i, e)}
                        className="w-full p-1.5 bg-[#1c1c1c] border border-[#333333] rounded text-[#B0B0B0]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#A0A0A0] mb-1">
                        Amount (₱)
                      </label>
                      <input
                        type="number"
                        name="amount"
                        value={item.amount}
                        min="0"
                        step="0.01"
                        onChange={(e) => handleParticularChange(i, e)}
                        className="w-full p-1.5 bg-[#1c1c1c] border border-[#333333] rounded text-[#B0B0B0]"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addParticular}
                className="flex items-center gap-1 text-[#A0A0A0] hover:text-[#FF9800] text-sm"
              >
                <Plus size={14} /> Add another particular
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <ScrollbarStyles />
    </div>
  )
}

export default Outgoing

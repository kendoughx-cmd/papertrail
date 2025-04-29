import React, { useState, useEffect, useCallback, useMemo } from 'react'
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
import DocumentTypes from '../components/IncomingDocumentTypes'
import ScrollbarStyles from '../components/ScrollbarStyles'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import IncomingStatus from '../components/IncomingStatus'
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

const initialFormData = {
  id: '',
  controlNo: '',
  dateReceived: '',
  dateOfAda: '',
  documentType: 'Disbursement Voucher',
  adaNo: '',
  jevNo: '',
  orNo: '',
  poNo: '',
  description: '',
  particulars: [{ item: '', quantity: '', amount: '' }],
  payee: '',
  natureOfPayment: '',
  agency: '',
  status: '',
  storageFile: '',
}

const Incoming = () => {
  const [incomingData, setIncomingData] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [currentMonthYear, setCurrentMonthYear] = useState(null)
  const [availableMonths, setAvailableMonths] = useState([])
  const [filterDocumentType, setFilterDocumentType] = useState(
    'Disbursement Voucher'
  )
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
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/get-incoming.php`
        )
        const data = await response.json()
        setIncomingData(data)
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
    fetchData()
  }, [])

  const validateForm = () => {
    const errors = {}
    if (!formData.documentType) errors.documentType = 'Required'
    if (!formData.dateOfAda) errors.dateOfAda = 'Required'
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
        ? incomingData.find((item) => item.id === formData.id)
        : null

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/${
          isEditMode ? 'update' : 'add'
        }-incoming.php`,
        {
          method: isEditMode ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: formData.id || '',
            dateOfAda: formData.dateOfAda || '',
            documentType: formData.documentType || '',
            adaNo: formData.adaNo || '',
            jevNo: formData.jevNo || '',
            orNo: formData.orNo || '',
            poNo: formData.poNo || '',
            description: formData.description || '',
            items: formData.particulars.map((p) => p.item || ''),
            quantities: formData.particulars.map(
              (p) => Number(p.quantity) || 0
            ),
            amounts: formData.particulars.map((p) => Number(p.amount) || 0),
            payee: formData.payee || '',
            natureOfPayment: formData.natureOfPayment || '',
            agency: formData.agency || '',
            status: formData.status || '',
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
          `${import.meta.env.VITE_BACKEND_URL}/get-incoming.php`
        )
        setIncomingData(await refreshResponse.json())
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
        const documentToDelete = incomingData.find((item) => item.id === id)

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/delete-incoming.php`,
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
            `${import.meta.env.VITE_BACKEND_URL}/get-incoming.php`
          )
          setIncomingData(await refreshResponse.json())
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
    const typeFiltered = incomingData.filter(
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
        ${item.controlNo || ''} ${item.dateReceived || ''} ${
        item.dateOfAda || ''
      }
        ${item.adaNo || ''} ${item.jevNo || ''} ${item.orNo || ''} ${
        item.poNo || ''
      }
        ${item.description || ''} ${
        Array.isArray(item.particulars) ? item.particulars.join(' ') : ''
      }
        ${Array.isArray(item.qty) ? item.qty.join(' ') : item.qty || ''}
        ${
          Array.isArray(item.amount) ? item.amount.join(' ') : item.amount || ''
        }
        ${item.totalAmount || ''} ${item.payee || ''} ${
        item.natureOfPayment || ''
      }
        ${item.agency || ''} ${item.status || ''} ${item.storageFile || ''}
      `.toLowerCase()
      return searchTerms.every((term) => searchString.includes(term))
    })
  }, [incomingData, currentMonthYear, filterDocumentType, search])

  const currentItems = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage
    return filteredData.slice(indexOfLastItem - itemsPerPage, indexOfLastItem)
  }, [filteredData, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const [year, month] = currentMonthYear?.split('-') || []
  const displayMonthYear = currentMonthYear
    ? `${getMonthName(+month)} ${year}`
    : 'Select month'

  const getVisibleColumns = () => {
    const baseColumns = [
      'Control No.',
      'Date Received',
      'Description',
      'Particulars',
      'Qty',
      'Amount',
      'Total Amount',
      'Payee',
      'Nature of Payment',
      'Agency',
      'Status',
      'Storage',
      'Actions',
    ]

    if (filterDocumentType === 'Official Receipt') {
      return [...baseColumns.slice(0, 2), 'O.R No.', ...baseColumns.slice(2)]
    }
    if (filterDocumentType === 'Purchase Order') {
      return [...baseColumns.slice(0, 2), 'P.O No.', ...baseColumns.slice(2)]
    }

    return [
      ...baseColumns.slice(0, 2),
      'Date of ADA',
      'Check No./ADA',
      'JEV No.',
      ...baseColumns.slice(2),
    ]
  }

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
        <h1 className="text-2xl font-semibold mb-2 text-[#FF9800]">Incoming</h1>
        <p className="text-[#B0B0B0] mb-4">Manage documents</p>

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
              <DocumentTypes
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
              columns={getVisibleColumns().filter(
                (col) => col !== 'Actions' && col !== 'Select'
              )}
              fileName="Incoming_Documents"
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
              Add Incoming
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
                {getVisibleColumns().map((header) => (
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
                    {getVisibleColumns().map((header) => {
                      switch (header) {
                        case 'Control No.':
                          return (
                            <td key={header} className="py-3 px-3">
                              {item.controlNo || '-'}
                            </td>
                          )
                        case 'Date Received':
                          return (
                            <td key={header} className="py-3 px-3">
                              {item.dateReceived || '-'}
                            </td>
                          )
                        case 'Date of ADA':
                          return (
                            <td key={header} className="py-3 px-3">
                              {renderCellContent(item.dateOfAda)}
                            </td>
                          )
                        case 'Check No./ADA':
                          return (
                            <td key={header} className="py-3 px-3">
                              {renderCellContent(item.adaNo)}
                            </td>
                          )
                        case 'JEV No.':
                          return (
                            <td key={header} className="py-3 px-3">
                              {renderCellContent(item.jevNo)}
                            </td>
                          )
                        case 'O.R No.':
                          return (
                            <td key={header} className="py-3 px-3">
                              {renderCellContent(item.orNo)}
                            </td>
                          )
                        case 'P.O No.':
                          return (
                            <td key={header} className="py-3 px-3">
                              {renderCellContent(item.poNo)}
                            </td>
                          )
                        case 'Description':
                          return (
                            <td key={header} className="py-3 px-3">
                              {renderCellContent(
                                item.description,
                                formatTitleCase
                              )}
                            </td>
                          )
                        case 'Particulars':
                          return (
                            <td key={header} className="py-3 px-3">
                              {renderCellContent(
                                item.particulars,
                                formatTitleCase
                              )}
                            </td>
                          )
                        case 'Qty':
                          return (
                            <td key={header} className="py-3 px-3">
                              {renderCellContent(item.qty)}
                            </td>
                          )
                        case 'Amount':
                          return (
                            <td key={header} className="py-3 px-3">
                              {renderCellContent(item.amount, null, true)}
                            </td>
                          )
                        case 'Total Amount':
                          return (
                            <td key={header} className="py-3 px-3 ">
                              {item.totalAmount === 0 ||
                              isEmpty(item.totalAmount) ? (
                                '-'
                              ) : (
                                <span className="font-semibold text-yellow-400">
                                  {formatCurrency(item.totalAmount)}
                                </span>
                              )}
                            </td>
                          )
                        case 'Payee':
                          return (
                            <td key={header} className="py-3 px-3">
                              {renderCellContent(item.payee, formatTitleCase)}
                            </td>
                          )
                        case 'Nature of Payment':
                          return (
                            <td key={header} className="py-3 px-3">
                              {renderCellContent(item.natureOfPayment, (v) =>
                                v.toUpperCase()
                              )}
                            </td>
                          )
                        case 'Agency':
                          return (
                            <td key={header} className="py-3 px-3">
                              {renderCellContent(item.agency)}
                            </td>
                          )
                        case 'Status':
                          return (
                            <td key={header} className="py-3 px-3">
                              <span className="text-green-400 font-medium">
                                {renderCellContent(item.status)}
                              </span>
                            </td>
                          )
                        case 'Storage':
                          return (
                            <td key={header} className="py-3 px-3">
                              {renderCellContent(item.storageFile)}
                            </td>
                          )
                        case 'Actions':
                          return (
                            <td key={header} className="py-3 px-3">
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
                          )
                        default:
                          return null
                      }
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={getVisibleColumns().length + 1}
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
            <DocumentTypes
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
            <label className="block text-[#B0B0B0] mb-1">Date of ADA *</label>
            <input
              type="date"
              name="dateOfAda"
              value={formData.dateOfAda}
              onChange={handleInputChange}
              className="w-full p-2 bg-transparent border border-[#333333] rounded text-[#B0B0B0] [color-scheme:dark]"
            />
            {formErrors.dateOfAda && (
              <p className="text-red-400 text-xs mt-1">
                {formErrors.dateOfAda}
              </p>
            )}
          </div>

          {formData.documentType !== 'Official Receipt' &&
            formData.documentType !== 'Purchase Order' && (
              <>
                <div>
                  <label className="block text-[#B0B0B0] mb-1">ADA No.</label>
                  <input
                    type="text"
                    name="adaNo"
                    value={formData.adaNo}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-transparent border border-[#333333] rounded text-[#B0B0B0]"
                  />
                </div>
                <div>
                  <label className="block text-[#B0B0B0] mb-1">JEV No.</label>
                  <input
                    type="text"
                    name="jevNo"
                    value={formData.jevNo}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-transparent border border-[#333333] rounded text-[#B0B0B0]"
                  />
                </div>
              </>
            )}

          {formData.documentType === 'Official Receipt' && (
            <div>
              <label className="block text-[#B0B0B0] mb-1">O.R No.</label>
              <input
                type="text"
                name="orNo"
                value={formData.orNo}
                onChange={handleInputChange}
                className="w-full p-2 bg-transparent border border-[#333333] rounded text-[#B0B0B0]"
              />
            </div>
          )}

          {formData.documentType === 'Purchase Order' && (
            <div>
              <label className="block text-[#B0B0B0] mb-1">P.O No.</label>
              <input
                type="text"
                name="poNo"
                value={formData.poNo}
                onChange={handleInputChange}
                className="w-full p-2 bg-transparent border border-[#333333] rounded text-[#B0B0B0]"
              />
            </div>
          )}

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
            <label className="block text-[#B0B0B0] mb-1">Payee</label>
            <input
              type="text"
              name="payee"
              value={formData.payee}
              onChange={handleInputChange}
              className="w-full p-2 bg-transparent border border-[#333333] rounded text-[#B0B0B0]"
            />
          </div>

          <div>
            <label className="block text-[#B0B0B0] mb-1">
              Nature of Payment
            </label>
            <input
              type="text"
              name="natureOfPayment"
              value={formData.natureOfPayment}
              onChange={handleInputChange}
              className="w-full p-2 bg-transparent border border-[#333333] rounded text-[#B0B0B0]"
            />
          </div>

          <div>
            <label className="block text-[#B0B0B0] mb-1">Agency</label>
            <AgencyDropdown
              value={formData.agency}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="block text-[#B0B0B0] mb-1">Status</label>
            <IncomingStatus
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

export default Incoming

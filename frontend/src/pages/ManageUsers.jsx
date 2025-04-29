import React, { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import {
  MagnifyingGlass,
  Pencil,
  Trash,
  Key,
  CaretLeft,
  CaretRight,
  X,
  DownloadSimple,
} from '@phosphor-icons/react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Sidebar from '../components/Sidebar'
import Modal from '../components/Modal'
import ScrollbarStyles from '../components/ScrollbarStyles'
import Role from '../components/Role'
import ExportPDFButton from '../components/ExportPDFButton'

const toTitleCase = (str) =>
  str
    ? str
        .toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : ''

const isEmpty = (value) =>
  value == null || value === '' || (Array.isArray(value) && value.length === 0)

const tableHeaders = [
  'ID Number',
  'Name',
  'Email',
  'Role',
  'Address',
  'Actions',
]

const initialFormData = {
  id: '',
  idNumber: '',
  firstName: '',
  middleName: '',
  lastName: '',
  email: '',
  address: '',
  password: '',
  role: '',
}

const SearchFilter = ({ onSearch, onClear, placeholder = 'Search...' }) => {
  const [searchTerm, setSearchTerm] = useState('')
  useEffect(() => {
    const timer = setTimeout(
      () => (searchTerm.trim() ? onSearch(searchTerm.trim()) : onClear()),
      300
    )
    return () => clearTimeout(timer)
  }, [searchTerm, onSearch, onClear])

  return (
    <div className="relative w-full max-w-md">
      <div className="relative flex items-center">
        <MagnifyingGlass
          size={20}
          color="#A0A0A0"
          className="absolute left-3 top-1/2 transform -translate-y-1/2"
        />
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 pl-10 pr-10 bg-[#1c1c1c] border border-[#333333] rounded-lg text-[#B0B0B0] focus:outline-none focus:border-[#FF9800]"
        />
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm('')
              onClear()
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#A0A0A0] hover:text-[#FF9800]"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  )
}

const ManageUsers = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [search, setSearch] = useState('')
  const [usersData, setUsersData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [formData, setFormData] = useState(initialFormData)
  const [formErrors, setFormErrors] = useState({})
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRows, setSelectedRows] = useState([])
  const itemsPerPage = 7

  const validateForm = () => {
    const errors = {}
    if (!formData.idNumber.trim()) errors.idNumber = 'ID Number is required'
    if (!formData.firstName.trim()) errors.firstName = 'First Name is required'
    if (!formData.lastName.trim()) errors.lastName = 'Last Name is required'
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format'
    }
    if (!isEditMode && !formData.password) {
      errors.password = 'Password is required'
    } else if (!isEditMode && formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    }
    if (!formData.role) errors.role = 'Role is required'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/get-manage-users.php`,
        {
          withCredentials: true,
        }
      )
      setUsersData(res.data.users || [])
    } catch (err) {
      console.error('Error fetching users:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (formErrors[name])
      setFormErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    const formattedData = {
      id_number: formData.idNumber,
      first_name: toTitleCase(formData.firstName),
      middle_name: toTitleCase(formData.middleName),
      last_name: toTitleCase(formData.lastName),
      email: formData.email,
      password: formData.password,
      role: toTitleCase(formData.role),
      address: formData.address || '',
    }

    try {
      const url = isEditMode
        ? `${import.meta.env.VITE_BACKEND_URL}/update-manage-user.php`
        : `${import.meta.env.VITE_BACKEND_URL}/register.php`

      const loadingToast = toast.loading(
        isEditMode ? 'Updating user...' : 'Creating user...',
        { position: 'top-right' }
      )

      const response = await axios[isEditMode ? 'put' : 'post'](
        url,
        formattedData,
        {
          withCredentials: true,
        }
      )

      if (response.data.status === 'error' && response.data.errors) {
        // Handle backend validation errors
        setFormErrors(response.data.errors)
        toast.update(loadingToast, {
          render: 'Please fix the form errors',
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
        return
      }

      toast.update(loadingToast, {
        render: isEditMode
          ? 'User updated successfully!'
          : 'User created successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      })

      fetchUsers()
      resetForm()
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          (isEditMode ? 'Failed to update user' : 'Failed to create user'),
        {
          position: 'top-right',
          autoClose: 3000,
        }
      )
      console.error('Error:', err)
    }
  }

  const resetForm = () => {
    setIsModalOpen(false)
    setIsEditMode(false)
    setFormData(initialFormData)
    setFormErrors({})
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const deleteToast = toast.loading('Deleting user...', {
          position: 'top-right',
        })

        await axios.delete(
          `${import.meta.env.VITE_BACKEND_URL}/delete-manage-user.php`,
          {
            data: { id },
            withCredentials: true,
          }
        )

        toast.update(deleteToast, {
          render: 'User deleted successfully!',
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        })

        fetchUsers()
        setSelectedRows((prev) => prev.filter((rowId) => rowId !== id))
      } catch (err) {
        toast.error('Failed to delete user', {
          position: 'top-right',
          autoClose: 3000,
        })
        console.error('Error deleting user:', err)
      }
    }
  }

  const handleEdit = (user) => {
    setIsEditMode(true)
    setIsModalOpen(true)
    setFormData({
      id: user.id || '',
      idNumber: user.id_number || '',
      firstName: user.first_name || '',
      middleName: user.middle_name || '',
      lastName: user.last_name || '',
      address: user.address || '',
      email: user.email || '',
      password: '',
      role: toTitleCase(user.role) || '',
    })
  }

  const handleAddUser = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const filteredUsers = useMemo(() => {
    const searchTerms = search.trim().toLowerCase().split(/\s+/)
    if (!searchTerms.length) return usersData

    return usersData.filter(
      ({
        id_number,
        first_name,
        middle_name,
        last_name,
        email,
        role,
        address,
      }) => {
        const userDataString = [
          id_number || '',
          first_name || '',
          middle_name || '',
          last_name || '',
          email || '',
          role || '',
          address || '',
        ]
          .join(' ')
          .toLowerCase()

        return searchTerms.every((word) => userDataString.includes(word))
      }
    )
  }, [usersData, search])

  const currentItems = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage
    return filteredUsers.slice(indexOfLastItem - itemsPerPage, indexOfLastItem)
  }, [filteredUsers, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)

  useEffect(() => {
    setCurrentPage(1)
  }, [search])

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

  const renderCellContent = (value) => {
    if (isEmpty(value)) return '-'
    return toTitleCase(value)
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
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      <div className="flex-1 overflow-y-auto p-6 h-screen custom-scrollbar">
        <h1 className="text-2xl font-semibold mb-2 text-[#FF9800]">
          Manage Users
        </h1>
        <p className="text-[#B0B0B0] mb-4">Add, edit, or remove users</p>

        <div className="flex justify-between items-center mb-4">
          <SearchFilter
            onSearch={(term) => setSearch(term)}
            onClear={() => setSearch('')}
            placeholder="Search users..."
          />
          <div className="flex gap-3">
            <ExportPDFButton
              data={filteredUsers}
              selectedRows={selectedRows}
              columns={tableHeaders.filter((col) => col !== 'Actions')}
              fileName="User_Records"
              includeDate={true}
              isUserData={true}
            />
            <button
              onClick={handleAddUser}
              className="bg-transparent border-2 border-[#FF9800] text-[#FF9800] font-semibold py-1.5 px-4 rounded-md hover:bg-[#FF9800] hover:text-black transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#FF9800]"
            >
              Add User
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
                currentItems.map(
                  ({
                    id,
                    id_number,
                    first_name,
                    middle_name,
                    last_name,
                    email,
                    role,
                    address,
                  }) => (
                    <tr
                      key={id}
                      className="border-b border-[#333333] hover:bg-[#222222]"
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(id)}
                            onChange={() => handleRowSelection(id)}
                            className="h-4 w-4 rounded border border-[#555555] bg-[#1a1a1a] text-[#FF9800] focus:ring-1 focus:ring-[#FF9800] focus:ring-offset-0 cursor-pointer appearance-none hover:border-[#777777] checked:bg-[#1a1a1a] checked:border-[#FF9800]"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-3 text-[#B0B0B0] break-words">
                        {renderCellContent(id_number)}
                      </td>
                      <td className="py-3 px-3 text-[#B0B0B0] break-words">
                        {renderCellContent(first_name)}{' '}
                        {middle_name && `${renderCellContent(middle_name)} `}{' '}
                        {renderCellContent(last_name)}
                      </td>
                      <td className="py-3 px-3 text-[#B0B0B0] break-words">
                        {renderCellContent(email)}
                      </td>
                      <td className="py-3 px-3 text-[#B0B0B0] break-words">
                        {renderCellContent(role)}
                      </td>
                      <td className="py-3 px-3 text-[#B0B0B0] break-words">
                        {renderCellContent(address) || 'No address provided'}
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() =>
                            handleEdit({
                              id,
                              id_number,
                              first_name,
                              middle_name,
                              last_name,
                              email,
                              role,
                              address,
                            })
                          }
                          className="text-[#4A90E2] hover:text-[#2C73B7]"
                        >
                          <Pencil size={20} color="#4A90E2" />
                        </button>
                        <button
                          onClick={() => handleDelete(id)}
                          className="text-[#D0021B] hover:text-[#B42A2A] ml-2"
                        >
                          <Trash size={20} color="#D0021B" />
                        </button>
                      </td>
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td
                    colSpan={tableHeaders.length + 1}
                    className="text-center py-4 text-[#A0A0A0]"
                  >
                    {search ? 'No matching users found' : 'No users available'}
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
        title={isEditMode ? 'Edit User' : 'Add User'}
        buttonText={isEditMode ? 'Update' : 'Add'}
      >
        <div className="space-y-3">
          <div>
            <label className="block text-[#B0B0B0] mb-1">ID Number *</label>
            <input
              type="text"
              id="idNumber"
              name="idNumber"
              value={formData.idNumber}
              onChange={handleInputChange}
              className={`w-full p-2 bg-transparent border ${
                formErrors.idNumber ? 'border-red-500' : 'border-[#333333]'
              } rounded text-[#B0B0B0]`}
              autoComplete="off"
            />
            {formErrors.idNumber && (
              <p className="text-red-400 text-xs mt-1">{formErrors.idNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-[#B0B0B0] mb-1">First Name *</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className={`w-full p-2 bg-transparent border ${
                formErrors.firstName ? 'border-red-500' : 'border-[#333333]'
              } rounded text-[#B0B0B0]`}
              autoComplete="off"
            />
            {formErrors.firstName && (
              <p className="text-red-400 text-xs mt-1">
                {formErrors.firstName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[#B0B0B0] mb-1">Middle Name</label>
            <input
              type="text"
              id="middleName"
              name="middleName"
              value={formData.middleName}
              onChange={handleInputChange}
              className="w-full p-2 bg-transparent border border-[#333333] rounded text-[#B0B0B0]"
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-[#B0B0B0] mb-1">Last Name *</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className={`w-full p-2 bg-transparent border ${
                formErrors.lastName ? 'border-red-500' : 'border-[#333333]'
              } rounded text-[#B0B0B0]`}
              autoComplete="off"
            />
            {formErrors.lastName && (
              <p className="text-red-400 text-xs mt-1">{formErrors.lastName}</p>
            )}
          </div>

          <div>
            <label className="block text-[#B0B0B0] mb-1">Email *</label>
            <input
              type="text"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full p-2 bg-transparent border ${
                formErrors.email ? 'border-red-500' : 'border-[#333333]'
              } rounded text-[#B0B0B0]`}
              autoComplete="off"
            />
            {formErrors.email && (
              <p className="text-red-400 text-xs mt-1">{formErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-[#B0B0B0] mb-1">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full p-2 bg-transparent border border-[#333333] rounded text-[#B0B0B0]"
              autoComplete="off"
            />
          </div>

          {!isEditMode && (
            <div>
              <label className="block text-[#B0B0B0] mb-1">Password *</label>
              <div className="relative">
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full p-2 pr-10 bg-transparent border ${
                    formErrors.password ? 'border-red-500' : 'border-[#333333]'
                  } rounded text-[#B0B0B0]`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible((prev) => !prev)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 focus:outline-none"
                >
                  <Key
                    size={20}
                    color="#A0A0A0"
                    className={passwordVisible ? 'text-[#FF9800]' : ''}
                  />
                </button>
              </div>
              {formErrors.password && (
                <p className="text-red-400 text-xs mt-1">
                  {formErrors.password}
                </p>
              )}
            </div>
          )}

          <Role
            formData={formData}
            handleInputChange={handleInputChange}
            error={formErrors.role}
          />
          {formErrors.role && (
            <p className="text-red-400 text-xs mt-1">{formErrors.role}</p>
          )}
        </div>
      </Modal>

      <ScrollbarStyles />
    </div>
  )
}

export default ManageUsers

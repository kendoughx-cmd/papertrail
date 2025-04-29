import React, { useState, useEffect } from 'react'
import { Pencil, UserCircle } from '@phosphor-icons/react'
import Sidebar from '../components/Sidebar'
import Modal from '../components/Modal'
import ScrollbarStyles from '../components/ScrollbarStyles'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useNavigate } from 'react-router-dom'

const Profile = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState({
    id_number: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    address: '',
    role: '',
  })
  const navigate = useNavigate()

  // Fetch user data on component mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    const fetchUserData = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/get-user-profile.php`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (response.status === 401) {
          localStorage.removeItem('token')
          navigate('/login')
          return
        }

        if (!response.ok) {
          throw new Error('Failed to fetch user data')
        }

        const data = await response.json()
        if (data.success) {
          setUserData({
            id_number: data.user.id_number || '',
            first_name: data.user.first_name || '',
            middle_name: data.user.middle_name || '',
            last_name: data.user.last_name || '',
            email: data.user.email || '',
            address: data.user.address || '',
            role: data.user.role || '',
          })
        }
      } catch (error) {
        console.error('Error:', error)
        toast.error(error.message)
        setUserData((prev) => ({
          ...prev,
          first_name: '',
          middle_name: '',
          last_name: '',
          email: '',
          address: '',
          role: '',
        }))
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setUserData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/update-profile.php`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            first_name: userData.first_name,
            middle_name: userData.middle_name,
            last_name: userData.last_name,
            address: userData.address,
          }),
        }
      )

      if (response.status === 401) {
        localStorage.removeItem('token')
        navigate('/login')
        return
      }

      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update profile')
      }

      toast.success('Profile updated successfully!')
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error:', error)
      toast.error(error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-[#1a1a1a] text-[#B0B0B0]">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF9800] mx-auto mb-4"></div>
            <p>Loading profile data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#1a1a1a] text-[#B0B0B0] overflow-hidden">
      <Sidebar />
      <ToastContainer position="top-right" autoClose={5000} theme="dark" />

      <div className="flex-1 overflow-y-auto p-6 h-screen custom-scrollbar">
        <div className="mb-2">
          <h1 className="text-2xl font-semibold text-[#FF9800]">
            User Profile
          </h1>
          <p className="text-[#B0B0B0]">
            View and manage your profile information
          </p>
        </div>

        {/* Button Row */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-[#FF9800] text-[#FF9800] rounded-lg hover:bg-[#FF9800] hover:text-black transition-colors"
          >
            <Pencil size={18} weight="bold" />
            Edit Profile
          </button>
        </div>

        {/* Profile Card */}
        <div className="border border-[#333333] rounded-lg p-6 shadow-lg">
          <div className="flex items-start space-x-6">
            <UserCircle size={80} color="#FF9800" weight="duotone" />
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-1">
                {userData.first_name} {userData.middle_name}{' '}
                {userData.last_name}
              </h3>
              <p className="text-[#B0B0B0] mb-4">{userData.email}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="text-[#D0D0D0] text-sm font-medium mb-1">
                    ID Number
                  </h4>
                  <p className="text-white">{userData.id_number}</p>
                </div>
                <div>
                  <h4 className="text-[#D0D0D0] text-sm font-medium mb-1">
                    Role
                  </h4>
                  <p className="text-white">{userData.role}</p>
                </div>
                <div>
                  <h4 className="text-[#D0D0D0] text-sm font-medium mb-1">
                    First Name
                  </h4>
                  <p className="text-white">{userData.first_name}</p>
                </div>
                <div>
                  <h4 className="text-[#D0D0D0] text-sm font-medium mb-1">
                    Middle Name
                  </h4>
                  <p className="text-white">{userData.middle_name || '-'}</p>
                </div>
                <div>
                  <h4 className="text-[#D0D0D0] text-sm font-medium mb-1">
                    Last Name
                  </h4>
                  <p className="text-white">{userData.last_name}</p>
                </div>
                <div>
                  <h4 className="text-[#D0D0D0] text-sm font-medium mb-1">
                    Email
                  </h4>
                  <p className="text-white">{userData.email}</p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-[#D0D0D0] text-sm font-medium mb-1">
                  Address
                </h4>
                <p className="text-white">
                  {userData.address || 'Not specified'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        title="Edit Profile"
        buttonText="Save Changes"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-[#B0B0B0] mb-1" htmlFor="first_name">
              First Name *
            </label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={userData.first_name}
              onChange={handleInputChange}
              className="w-full p-2.5 bg-[#1c1c1c] border border-[#333333] rounded-lg text-[#B0B0B0] focus:outline-none focus:border-[#FF9800]"
              required
            />
          </div>

          <div>
            <label className="block text-[#B0B0B0] mb-1" htmlFor="middle_name">
              Middle Name
            </label>
            <input
              type="text"
              id="middle_name"
              name="middle_name"
              value={userData.middle_name}
              onChange={handleInputChange}
              className="w-full p-2.5 bg-[#1c1c1c] border border-[#333333] rounded-lg text-[#B0B0B0] focus:outline-none focus:border-[#FF9800]"
            />
          </div>

          <div>
            <label className="block text-[#B0B0B0] mb-1" htmlFor="last_name">
              Last Name *
            </label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={userData.last_name}
              onChange={handleInputChange}
              className="w-full p-2.5 bg-[#1c1c1c] border border-[#333333] rounded-lg text-[#B0B0B0] focus:outline-none focus:border-[#FF9800]"
              required
            />
          </div>

          <div>
            <label className="block text-[#B0B0B0] mb-1" htmlFor="address">
              Address
            </label>
            <textarea
              id="address"
              name="address"
              value={userData.address}
              onChange={handleInputChange}
              className="w-full p-2.5 bg-[#1c1c1c] border border-[#333333] rounded-lg text-[#B0B0B0] focus:outline-none focus:border-[#FF9800]"
              rows="3"
            />
          </div>
        </div>
      </Modal>

      <ScrollbarStyles />
    </div>
  )
}

export default Profile

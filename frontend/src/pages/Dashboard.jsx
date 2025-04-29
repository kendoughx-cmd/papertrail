import React, { useState, useEffect } from 'react'
import {
  UsersThree,
  FileArrowDown,
  FileArrowUp,
  FileText,
} from '@phosphor-icons/react'
import Sidebar from '../components/Sidebar'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const [totalDocuments, setTotalDocuments] = useState(0)
  const [incoming, setIncoming] = useState(0)
  const [outgoing, setOutgoing] = useState(0)
  const [users, setUsers] = useState(0)
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState({
    id_number: '',
    role: '',
    first_name: 'User',
  })
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    const fetchData = async () => {
      try {
        // Fetch user profile data
        const profileResponse = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/get-user-profile.php`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (profileResponse.status === 401) {
          localStorage.removeItem('token')
          navigate('/login')
          return
        }

        if (!profileResponse.ok) {
          throw new Error('Failed to fetch user data')
        }

        const profileData = await profileResponse.json()
        if (profileData.success) {
          setUserData({
            id_number: profileData.user.id_number || '',
            role: profileData.user.role || '',
            first_name: profileData.user.first_name || 'User',
          })
        }

        // Fetch dashboard counts
        const countsResponse = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/get-dashboard-counts.php`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (countsResponse.status === 401) {
          localStorage.removeItem('token')
          navigate('/login')
          return
        }

        if (!countsResponse.ok) {
          throw new Error('Failed to fetch dashboard data')
        }

        const countsData = await countsResponse.json()
        if (countsData.success) {
          setTotalDocuments(countsData.data.documents || 0)
          setIncoming(countsData.data.incoming || 0)
          setOutgoing(countsData.data.outgoing || 0)
          setUsers(countsData.data.users || 0)
        }
      } catch (error) {
        console.error('Error:', error)
        toast.error(error.message)
        // Fallback data
        setTotalDocuments(0)
        setIncoming(0)
        setOutgoing(0)
        setUsers(0)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 300000) // Fetch data every 5 minutes
    return () => clearInterval(interval)
  }, [navigate])

  const formatNumber = (num) => {
    return num.toLocaleString('en-US')
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-[#1a1a1a] text-[#B0B0B0]">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF9800] mx-auto mb-4"></div>
            <p>Loading dashboard data...</p>
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
        <h1 className="text-2xl font-semibold mb-2 text-[#FF9800]">
          Dashboard Overview
        </h1>
        <p className="text-[#B0B0B0] mb-6">Welcome, {userData.first_name}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Documents */}
          <div className="bg-[#1e1e1e] border border-[#333333] rounded-lg p-6 shadow-lg hover:shadow-[#FF9800]/20 transition-all">
            <div className="flex items-center gap-6">
              <div className="bg-[#FF9800] p-4 rounded-full">
                <FileText size={32} color="#1e1e1e" weight="fill" />
              </div>
              <div>
                <p className="text-[#B0B0B0] mb-1">Total Documents</p>
                <p className="text-3xl font-semibold text-[#E0E0E0]">
                  {formatNumber(totalDocuments)}
                </p>
              </div>
            </div>
          </div>

          {/* Incoming */}
          <div className="bg-[#1e1e1e] border border-[#333333] rounded-lg p-6 shadow-lg hover:shadow-[#4CAF50]/20 transition-all">
            <div className="flex items-center gap-6">
              <div className="bg-[#4CAF50] p-4 rounded-full">
                <FileArrowDown size={32} color="#1e1e1e" weight="fill" />
              </div>
              <div>
                <p className="text-[#B0B0B0] mb-1">Incoming</p>
                <p className="text-3xl font-semibold text-[#E0E0E0]">
                  {formatNumber(incoming)}
                </p>
              </div>
            </div>
          </div>

          {/* Outgoing */}
          <div className="bg-[#1e1e1e] border border-[#333333] rounded-lg p-6 shadow-lg hover:shadow-[#F44336]/20 transition-all">
            <div className="flex items-center gap-6">
              <div className="bg-[#F44336] p-4 rounded-full">
                <FileArrowUp size={32} color="#1e1e1e" weight="fill" />
              </div>
              <div>
                <p className="text-[#B0B0B0] mb-1">Outgoing</p>
                <p className="text-3xl font-semibold text-[#E0E0E0]">
                  {formatNumber(outgoing)}
                </p>
              </div>
            </div>
          </div>

          {/* Users */}
          <div className="bg-[#1e1e1e] border border-[#333333] rounded-lg p-6 shadow-lg hover:shadow-[#2196F3]/20 transition-all">
            <div className="flex items-center gap-6">
              <div className="bg-[#2196F3] p-4 rounded-full">
                <UsersThree size={32} color="#1e1e1e" weight="fill" />
              </div>
              <div>
                <p className="text-[#B0B0B0] mb-1">Users</p>
                <p className="text-3xl font-semibold text-[#E0E0E0]">
                  {formatNumber(users)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

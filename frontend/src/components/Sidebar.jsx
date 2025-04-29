import React, { useState, useEffect } from 'react'
import {
  House,
  DownloadSimple,
  UploadSimple,
  UsersThree,
  ClockCounterClockwise,
  UserCircle,
  SignOut,
} from '@phosphor-icons/react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import papertrailLogo from '../assets/papertrail.svg'

const Sidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [active, setActive] = useState(location.pathname)
  const [userRole, setUserRole] = useState('guest')

  useEffect(() => {
    const role = sessionStorage.getItem('userRole') || 'guest'
    setUserRole(role)
  }, [])

  const handleNavigation = (path) => {
    setActive(path)
    navigate(path)
  }

  const handleLogout = async () => {
    try {
      await axios.post(
        'http://localhost/logout.php',
        {},
        { withCredentials: true }
      )
      sessionStorage.clear()
      localStorage.removeItem('token')
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      sessionStorage.clear()
      localStorage.removeItem('token')
      navigate('/login')
    }
  }

  const roleBasedLinks = {
    admin: [
      { path: '/dashboard', icon: <House size={22} />, label: 'Dashboard' },
      {
        path: '/incoming',
        icon: <DownloadSimple size={22} />,
        label: 'Incoming',
      },
      {
        path: '/outgoing',
        icon: <UploadSimple size={22} />,
        label: 'Outgoing',
      },
      {
        path: '/manage-users',
        icon: <UsersThree size={22} />,
        label: 'Manage Users',
      },
      {
        path: '/logs',
        icon: <ClockCounterClockwise size={22} />,
        label: 'Logs',
      },
      { path: '/profile', icon: <UserCircle size={22} />, label: 'Profile' },
    ],
    auditteamleader: [
      { path: '/dashboard', icon: <House size={22} />, label: 'Dashboard' },
      {
        path: '/incoming',
        icon: <DownloadSimple size={22} />,
        label: 'Incoming',
      },
      {
        path: '/outgoing',
        icon: <UploadSimple size={22} />,
        label: 'Outgoing',
      },
      {
        path: '/logs',
        icon: <ClockCounterClockwise size={22} />,
        label: 'Logs',
      },
      { path: '/profile', icon: <UserCircle size={22} />, label: 'Profile' },
    ],
    auditteammember: [
      { path: '/dashboard', icon: <House size={22} />, label: 'Dashboard' },
      {
        path: '/incoming',
        icon: <DownloadSimple size={22} />,
        label: 'Incoming',
      },
      {
        path: '/logs',
        icon: <ClockCounterClockwise size={22} />,
        label: 'Logs',
      },
      {
        path: '/outgoing',
        icon: <UploadSimple size={22} />,
        label: 'Outgoing',
      },
      { path: '/profile', icon: <UserCircle size={22} />, label: 'Profile' },
    ],
    staff: [
      { path: '/dashboard', icon: <House size={22} />, label: 'Dashboard' },
      {
        path: '/incoming',
        icon: <DownloadSimple size={22} />,
        label: 'Incoming',
      },
      {
        path: '/outgoing',
        icon: <UploadSimple size={22} />,
        label: 'Outgoing',
      },
      { path: '/profile', icon: <UserCircle size={22} />, label: 'Profile' },
    ],
    intern: [
      { path: '/dashboard', icon: <House size={22} />, label: 'Dashboard' },
      {
        path: '/incoming',
        icon: <DownloadSimple size={22} />,
        label: 'Incoming',
      },
      {
        path: '/outgoing',
        icon: <UploadSimple size={22} />,
        label: 'Outgoing',
      },
      { path: '/profile', icon: <UserCircle size={22} />, label: 'Profile' },
    ],
    guest: [],
  }

  const linksToRender = roleBasedLinks[userRole] || []

  return (
    <div className="h-screen w-56 bg-[#1a1a1a] flex flex-col border-r border-[#333333] shadow-md">
      <div className="w-full overflow-visible -mt-10">
        <img
          src={papertrailLogo}
          alt="PaperTrail Logo"
          className="w-full h-auto max-h-[180px] object-cover"
        />
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto p-6 pt-4">
        <div className="space-y-4 flex flex-col items-start w-full">
          {linksToRender.map(({ path, icon, label }) => (
            <button
              key={path}
              onClick={() => handleNavigation(path)}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all text-base font-medium
                ${
                  active === path
                    ? 'bg-[#FF9800] text-black shadow-sm'
                    : 'hover:bg-[#333333] hover:text-white text-[#B0B0B0]'
                }`}
            >
              {React.cloneElement(icon, {
                color: active === path ? '#000000' : '#B0B0B0',
              })}
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="mt-auto w-full">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all text-base font-medium hover:bg-[#D0021B] hover:text-white text-[#B0B0B0] group"
          >
            <SignOut
              size={22}
              className="text-[#D0021B] group-hover:text-white transition-colors"
            />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar

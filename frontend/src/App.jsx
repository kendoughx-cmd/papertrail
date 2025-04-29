import React, { useEffect } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom'
import Login from './pages/auth/Login'
import Dashboard from './pages/Dashboard'
import Incoming from './pages/Incoming'
import Outgoing from './pages/Outgoing'
import ManageUsers from './pages/ManageUsers'
import Profile from './pages/Profile'
import Logs from './pages/Logs'

const TitleUpdater = () => {
  const location = useLocation()

  useEffect(() => {
    const routeTitles = {
      '/': 'Login',
      '/login': 'Login',
      '/dashboard': 'Dashboard',
      '/incoming': 'Incoming',
      '/outgoing': 'Outgoing',
      '/manage-users': 'Manage Users',
      '/logs': 'Logs',
      '/profile': 'Profile',
    }

    // Set the document title based on the current route
    document.title = routeTitles[location.pathname] || 'My App' // Default title is 'My App'
  }, [location])

  return null // This component doesn't need to render anything
}

const App = () => {
  return (
    <>
      <Router>
        <TitleUpdater /> {/* Title updater is now inside Router */}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/incoming" element={<Incoming />} />
          <Route path="/outgoing" element={<Outgoing />} />
          <Route path="/manage-users" element={<ManageUsers />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Router>
    </>
  )
}

export default App

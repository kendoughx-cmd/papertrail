import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { User, Lock, Key } from '@phosphor-icons/react'
import BackgroundLayout from './components/BackgroundLayout'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const [idNumber, setIdNumber] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const sessionUser = sessionStorage.getItem('user')
    if (sessionUser) {
      navigate('/dashboard')
    }
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setLoading(true)

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/login.php`,
        {
          id_number: idNumber,
          password: password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.data.success) {
        localStorage.setItem('token', response.data.token)
        sessionStorage.setItem('user', JSON.stringify(response.data.user))

        // ✅ Normalize and store user role
        const rawRole = response.data.user.role // e.g., "Audit Team Leader"
        const normalizedRole = rawRole.toLowerCase().replaceAll(' ', '') // "auditteamleader"
        sessionStorage.setItem('userRole', normalizedRole)

        navigate('/dashboard')
      } else {
        setMessage('Login failed.')
      }
    } catch {
      setMessage('Invalid credentials or server error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <BackgroundLayout>
      <div className="max-w-md w-full mx-auto px-6 py-10 bg-[#1a1a1a] border border-[#333333] rounded-2xl shadow-lg">
        <h2 className="text-3xl font-semibold text-center text-[#FF9800] mb-4">
          Login
        </h2>
        <p className="text-center text-[#B0B0B0] mb-6">Access your account</p>

        {message && (
          <p className="text-center text-sm text-red-400 mb-4">{message}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <User
              size={22}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              className="w-full p-3 pl-12 bg-[#1c1c1c] border border-[#333333] text-[#B0B0B0] rounded-lg focus:outline-none focus:border-[#FF9800]"
              required
              placeholder="ID Number"
              autoComplete="username"
            />
          </div>

          <div className="relative">
            <Lock
              size={22}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 pl-12 pr-12 bg-[#1c1c1c] border border-[#333333] text-[#B0B0B0] rounded-lg focus:outline-none focus:border-[#FF9800]"
              required
              placeholder="Password"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <Key size={22} weight={showPassword ? 'fill' : 'regular'} />
            </button>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 px-4 py-3 border border-[#FF9800] text-[#FF9800] rounded-lg hover:bg-[#FF9800] hover:text-black transition-colors disabled:opacity-60"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </BackgroundLayout>
  )
}

export default Login

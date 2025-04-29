// src/pages/Logs.js
import React, { useState, useEffect, useMemo } from 'react'
import { MagnifyingGlass, CaretLeft, CaretRight } from '@phosphor-icons/react'
import Sidebar from '../components/Sidebar'
import ScrollbarStyles from '../components/ScrollbarStyles'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const tableHeaders = ['Log ID', 'Timestamp', 'Action', 'Description', 'User']

const Logs = () => {
  const [logsData, setLogsData] = useState([])
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const itemsPerPage = 10

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/get-logs.php`
        )
        const data = await response.json()

        if (data.success) {
          setLogsData(data.logs)
        } else {
          throw new Error(data.message || 'Failed to fetch logs')
        }
      } catch (error) {
        console.error('Error fetching logs:', error)
        toast.error(error.message || 'Failed to load logs')
      } finally {
        setIsLoading(false)
      }
    }

    fetchLogs()
  }, [])

  const filteredData = useMemo(() => {
    if (!search) return logsData

    const searchTerms = search
      .toLowerCase()
      .split(' ')
      .filter((term) => term)
    return logsData.filter((item) => {
      const searchString = `
        ${item.log_id || ''} ${item.timestamp || ''}
        ${item.action || ''} ${item.description || ''}
        ${item.user || ''}
      `.toLowerCase()
      return searchTerms.every((term) => searchString.includes(term))
    })
  }, [logsData, search])

  const currentItems = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage
    return filteredData.slice(indexOfLastItem - itemsPerPage, indexOfLastItem)
  }, [filteredData, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  const getActionColor = (action) => {
    switch (action?.toUpperCase()) {
      case 'CREATE':
        return 'text-green-500'
      case 'UPDATE':
        return 'text-yellow-500'
      case 'DELETE':
        return 'text-red-500'
      default:
        return 'text-blue-500'
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-[#1a1a1a] text-[#B0B0B0]">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF9800] mx-auto mb-4"></div>
            <p>Loading logs...</p>
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
          System Logs
        </h1>
        <p className="text-[#B0B0B0] mb-4">View all system activity logs</p>

        <div className="mb-4">
          <div className="relative w-full max-w-md">
            <div className="relative flex items-center">
              <MagnifyingGlass
                size={20}
                color="#A0A0A0"
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
              />
              <input
                type="text"
                placeholder="Search logs..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full p-2 pl-10 pr-10 bg-[#1c1c1c] border border-[#333333] rounded-lg text-[#B0B0B0] focus:outline-none focus:border-[#FF9800]"
              />
            </div>
          </div>
        </div>

        <div className="border border-[#333333] rounded-lg p-3 overflow-x-auto custom-scrollbar shadow-lg">
          <table className="w-full text-left text-sm min-w-max">
            <thead className="text-[#D0D0D0] border-b border-[#333333]">
              <tr>
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
                    <td className="py-3 px-3">{item.log_id}</td>
                    <td className="py-3 px-3">
                      {new Date(item.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`font-semibold ${getActionColor(
                          item.action
                        )}`}
                      >
                        {item.action}
                      </span>
                    </td>
                    <td className="py-3 px-3">{item.description}</td>
                    <td className="py-3 px-3">
                      <span className="text-[#A0A0A0]">
                        {item.user || '-'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={tableHeaders.length}
                    className="text-center py-4 text-[#A0A0A0]"
                  >
                    {search ? 'No matching logs found' : 'No logs available'}
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
      <ScrollbarStyles />
    </div>
  )
}

export default Logs

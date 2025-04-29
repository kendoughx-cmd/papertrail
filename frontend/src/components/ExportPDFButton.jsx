import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { DownloadSimple } from '@phosphor-icons/react'
import logo from '../assets/coa-logo.png'

const ExportPDFButton = ({
  data,
  selectedRows = [],
  columns,
  fileName = 'COA_Export',
  currentFilter = {},
  includeDate = true,
}) => {
  const getPropertyName = (column) => {
    const columnMappings = {
      // User data mappings
      'ID Number': 'id_number',
      Name: ['first_name', 'middle_name', 'last_name'],
      Email: 'email',
      Role: 'role',
      Address: 'address',

      // Document data mappings
      'Control No.': 'controlNo',
      'Date Received': 'dateReceived',
      'Date of ADA': 'dateOfAda',
      'Check No./ADA': 'adaNo',
      'JEV No.': 'jevNo',
      'O.R No.': 'orNo',
      'P.O No.': 'poNo',
      Description: 'description',
      Particulars: 'particulars',
      Qty: 'qty',
      Amount: 'amount',
      'Total Amount': 'totalAmount',
      Payee: 'payee',
      'Nature of Payment': 'natureOfPayment',
      Agency: 'agency',
      Status: 'status',
      Storage: 'storageFile',
    }

    return columnMappings[column] || column.toLowerCase().replace(/[^a-z]/g, '')
  }

  const formatCellValue = (column, value) => {
    if (value === null || value === undefined) return '-'

    // Special handling for user name fields
    if (Array.isArray(value) && column === 'Name') {
      return value.filter(Boolean).join(' ')
    }

    // Handle date fields
    if (column.includes('Date') && value !== '-') {
      return new Date(value).toLocaleDateString('en-PH')
    }

    // Handle array values (join with comma if array)
    if (Array.isArray(value)) {
      return value.join(', ')
    }

    return value
  }

  const drawHeader = (doc, pageWidth) => {
    // Blue header background
    doc.setFillColor(0, 56, 101)
    doc.rect(0, 0, pageWidth, 37, 'F')

    // Add logo
    const logoSize = 27
    const logoX = 52 // 20mm margin + 32mm offset
    const logoY = 6
    doc.addImage(logo, 'PNG', logoX, logoY, logoSize, logoSize)

    const centerX = pageWidth / 2

    // Header text
    doc.setFontSize(13)
    doc.setTextColor(255, 255, 255)
    doc.text('REPUBLIC OF THE PHILIPPINES', centerX, logoY + 6, {
      align: 'center',
    })

    doc.setFontSize(12)
    doc.text('COMMISSION ON AUDIT', centerX, logoY + 12, { align: 'center' })
    doc.setFontSize(11)
    doc.text('REGION X', centerX, logoY + 18, { align: 'center' })
    doc.text(
      'R10-01 SUCs AND OTHER STAND-ALONE AGENCIES',
      centerX,
      logoY + 24,
      { align: 'center' }
    )
  }

  const drawTitleAndDate = (doc, pageWidth) => {
    const titleY = 45
    doc.setFontSize(14)
    doc.setTextColor(0, 56, 101)
    doc.setFont(undefined, 'bold')

    const title = columns.includes('ID Number')
      ? 'USER MANAGEMENT REPORT'
      : `${currentFilter.documentType || 'DOCUMENT REPORT'}`.toUpperCase()

    doc.text(title, pageWidth / 2, titleY, { align: 'center' })

    if (currentFilter.monthYear) {
      doc.setFontSize(11)
      doc.setTextColor(80, 80, 80)
      doc.text(`${currentFilter.monthYear}`, pageWidth / 2, titleY + 8, {
        align: 'center',
      })
    }
  }

  const drawFilters = (doc, pageWidth, startY) => {
    if (Object.keys(currentFilter).length === 0) return startY

    doc.setFontSize(9)
    doc.setTextColor(0, 56, 101)

    let filterX = 25
    let filterY = startY
    let filtersPerRow = 0

    Object.entries(currentFilter).forEach(([key, value]) => {
      if (value && !['documentType', 'monthYear'].includes(key)) {
        const filterText = `${key}: ${value}`
        const textWidth =
          (doc.getStringUnitWidth(filterText) * doc.internal.getFontSize()) /
          doc.internal.scaleFactor

        if (filterX + textWidth > pageWidth - 35 && filtersPerRow > 0) {
          filterX = 25
          filterY += 5
          filtersPerRow = 0
        }

        doc.text(filterText, filterX, filterY)
        filterX += textWidth + 10
        filtersPerRow++
      }
    })

    return filterY + 10
  }

  const downloadPDF = () => {
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm' })
      const pageWidth = doc.internal.pageSize.width
      const pageHeight = doc.internal.pageSize.height
      const margin = 20
      const footerHeight = 20
      let isFirstPage = true

      // Get data to export
      const rowsToExport =
        selectedRows.length > 0
          ? data.filter((row) => selectedRows.includes(row.id))
          : data

      if (!rowsToExport.length) {
        alert('No data available to export')
        return
      }

      // Calculate dynamic table width and centering
      const isUserReport = columns.includes('ID Number')
      const columnCount = columns.length
      const maxColumnWidth = isUserReport ? 50 : 60 // Wider columns for user data
      const tableWidth = Math.min(
        columnCount * maxColumnWidth,
        pageWidth - margin * 2
      )
      const tableLeftMargin = (pageWidth - tableWidth) / 2

      // Prepare table data
      const tableData = rowsToExport.map((row) => {
        return columns.map((col) => {
          const property = getPropertyName(col)
          if (Array.isArray(property)) {
            const values = property.map((p) => row[p] || '')
            return formatCellValue(col, values)
          }
          return formatCellValue(col, row[property] || '')
        })
      })

      // Column styles configuration
      const columnStyles = {}
      columns.forEach((col, idx) => {
        columnStyles[idx] = {
          cellWidth: 'auto',
          halign: col.includes('Amount')
            ? 'right'
            : col.includes('Date') || col.includes('No.')
            ? 'center'
            : 'left',
        }

        // Special handling for user reports
        if (isUserReport) {
          if (col === 'ID Number' || col === 'Role') {
            columnStyles[idx].halign = 'center'
          } else if (col === 'Name' || col === 'Email' || col === 'Address') {
            columnStyles[idx].halign = 'left'
          }
        }
      })

      autoTable(doc, {
        head: [columns],
        body: tableData,
        startY: 60,
        margin: {
          left: tableLeftMargin,
          right: tableLeftMargin,
          bottom: footerHeight,
          top: 60,
        },
        tableWidth: tableWidth,
        styles: {
          fontSize: 8,
          cellPadding: 3,
          font: 'helvetica',
          textColor: [50, 50, 50],
          fillColor: [255, 255, 255],
          lineWidth: 0.2,
          lineColor: [220, 220, 220],
          valign: 'middle',
        },
        headStyles: {
          fillColor: [0, 56, 101],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 9,
          lineHeight: 1.25,
        },
        columnStyles: columnStyles,
        alternateRowStyles: {
          fillColor: [242, 246, 250],
        },
        didParseCell: (data) => {
          // Add some padding to cells
          data.cell.styles.cellPadding = {
            top: 3,
            right: 3,
            bottom: 3,
            left: 3,
          }
        },
        willDrawPage: (data) => {
          drawHeader(doc, pageWidth)
          drawTitleAndDate(doc, pageWidth)

          if (isFirstPage && Object.keys(currentFilter).length > 0) {
            const filterEndY = drawFilters(doc, pageWidth, 65)
            data.table.startY = filterEndY
            isFirstPage = false
          }
        },
        didDrawPage: (data) => {
          const footerY = pageHeight - 15
          doc.setFontSize(8)
          doc.setTextColor(100, 100, 100)
          doc.setDrawColor(0, 56, 101)
          doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5)

          doc.text(
            `COA Region X - R10-01 • Page ${data.pageNumber}`,
            margin,
            footerY
          )

          if (data.pageNumber === doc.internal.getNumberOfPages()) {
            doc.text(
              `Generated: ${new Date().toLocaleDateString('en-PH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}`,
              pageWidth - margin,
              footerY,
              { align: 'right' }
            )
          }
        },
        tableLineWidth: 0,
        showHead: 'everyPage',
        bodyStyles: { valign: 'top' },
        pageBreak: 'auto',
        rowPageBreak: 'avoid',
      })

      const dateSuffix = includeDate
        ? `_${new Date().toISOString().slice(0, 10)}`
        : ''
      doc.save(`${fileName}${dateSuffix}.pdf`)
    } catch (error) {
      console.error('PDF generation error:', error)
      alert('Failed to generate PDF. Please try again.')
    }
  }

  return (
    <button
      onClick={downloadPDF}
      className="flex items-center gap-2 px-4 py-2 rounded-md border border-blue-700 bg-transparent text-blue-700 hover:bg-blue-700 hover:text-white transition-colors text-sm font-medium shadow-sm"
      aria-label="Export to PDF"
    >
      <DownloadSimple size={18} weight="bold" />
      <span>Export PDF</span>
    </button>
  )
}

export default ExportPDFButton

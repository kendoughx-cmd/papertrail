export const formatTitleCase = (str) =>
  !str
    ? ''
    : String(str).replace(
        /\w\S*/g,
        (word) => word.charAt(0).toUpperCase() + word.substr(1).toLowerCase()
      )

export const getMonthName = (month) =>
  month
    ? new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' })
    : ''

export const formatCurrency = (amount) =>
  !amount || isNaN(amount)
    ? '-'
    : new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
      }).format(amount)

export const isEmpty = (value) =>
  value == null ||
  value === '' ||
  (Array.isArray(value) && value.every((item) => isEmpty(item)))

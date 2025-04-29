// src/utils/logging.js
const COMMON_FIELDS = [
  'controlNo',
  'dateReleased',
  'documentType',
  'description',
  'agency',
  'status',
  'receivedBy',
  'storageFile',
]

const INCOMING_FIELDS = [
  'dateOfAda',
  'adaNo',
  'jevNo',
  'orNo',
  'poNo',
  'payee',
  'natureOfPayment',
]

export const generateLogDescription = (
  action,
  documentType,
  controlNo,
  changes = null
) => {
  let actionVerb = ''
  let description = ''
  let particularsUpdatedDescription = ''

  switch (action) {
    case 'CREATE':
      actionVerb = 'Created'
      description = `${actionVerb} ${documentType}`
      if (controlNo) description += ` with Control No. ${controlNo}`
      break

    case 'UPDATE':
      actionVerb = 'Updated'
      description = `${actionVerb} ${documentType}`
      if (controlNo) description += ` (${controlNo})`

      if (changes) {
        const changedFields = []

        COMMON_FIELDS.forEach((field) => {
          if (changes[field]?.from !== changes[field]?.to) {
            changedFields.push(
              `${field}: ${changes[field].from || 'blank'} → ${
                changes[field].to || 'blank'
              }`
            )
          }
        })

        INCOMING_FIELDS.forEach((field) => {
          if (changes[field]?.from !== changes[field]?.to) {
            changedFields.push(
              `${field}: ${changes[field].from || 'blank'} → ${
                changes[field].to || 'blank'
              }`
            )
          }
        })

        if (changedFields.length > 0) {
          description += `: ${changedFields.join(', ')}`
        }

        if (changes?.particularsUpdated) {
          particularsUpdatedDescription = '[Particulars Updated]'
        }
      }
      break

    case 'DELETE':
      actionVerb = 'Deleted'
      description = `${actionVerb} ${documentType}`
      if (controlNo) description += ` (Control No. ${controlNo})`
      break

    default:
      actionVerb = 'Performed action on'
      description = `${actionVerb} ${documentType}`
      if (controlNo) description += ` (${controlNo})`
  }

  if (particularsUpdatedDescription) {
    description += ` ${particularsUpdatedDescription}`
  }

  return description
}

export const trackParticularsChanges = (original, updated) => {
  const originalParts = Array.isArray(original.particulars)
    ? original.particulars
    : []
  const updatedParts = Array.isArray(updated.particulars)
    ? updated.particulars
    : []

  if (JSON.stringify(originalParts) !== JSON.stringify(updatedParts)) {
    return { particularsUpdated: true }
  }

  return {}
}

export const trackChanges = (original, updated) => {
  const changes = {}

  if (!original || !updated) return changes

  COMMON_FIELDS.forEach((field) => {
    if (original[field] !== updated[field]) {
      changes[field] = {
        from: original[field] ?? '(empty)',
        to: updated[field] ?? '(empty)',
      }
    }
  })

  INCOMING_FIELDS.forEach((field) => {
    if (original[field] !== updated[field]) {
      changes[field] = {
        from: original[field] ?? '(empty)',
        to: updated[field] ?? '(empty)',
      }
    }
  })

  const particularsChanges = trackParticularsChanges(original, updated)
  if (
    Object.keys(changes).length > 0 &&
    particularsChanges.particularsUpdated
  ) {
    changes.particularsUpdated = true
  }

  return changes
}

export const logAction = async (
  action,
  documentType,
  controlNo,
  user,
  additionalData = {}
) => {
  try {
    const description = generateLogDescription(
      action,
      documentType,
      controlNo,
      additionalData.changes
    )

    // Simple user display name construction
    const userDisplay =
      user && user.first_name
        ? `${user.first_name}${
            user.last_name ? ' ' + user.last_name : ''
          }`.trim()
        : 'System'

    const logData = {
      action,
      description,
      documentType,
      controlNo,
      user: userDisplay,
      ...additionalData,
    }

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/add-log.php`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logData),
      }
    )

    if (!response.ok) {
      throw new Error('Failed to log action')
    }

    return await response.json()
  } catch (error) {
    console.error('Logging error:', error)
    return false
  }
}

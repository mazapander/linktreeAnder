const API_BASE = '/api'

const getAuthHeaders = () => {
  const token = localStorage.getItem('supabase_token')
  return token ? { 'Authorization': `Bearer ${token}` } : {}
}

export async function getProfile(slug) {
  const res = await fetch(`${API_BASE}/profiles/${slug}`)
  if (!res.ok) throw new Error('Profile not found')
  return res.json()
}

export async function getStats(slug, period = '7d') {
  const res = await fetch(`${API_BASE}/profiles/${slug}/stats?period=${period}`)
  return res.json()
}

export async function createProfile(data) {
  const res = await fetch(`${API_BASE}/admin/profiles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Error creating profile')
  }
  return res.json()
}

export async function updateProfile(slug, data) {
  const res = await fetch(`${API_BASE}/admin/profiles/${slug}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function createLink(slug, data) {
  const res = await fetch(`${API_BASE}/admin/profiles/${slug}/links`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Error creating link')
  }
  return res.json()
}

export async function updateLink(slug, linkId, data) {
  const res = await fetch(`${API_BASE}/admin/profiles/${slug}/links/${linkId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function deleteLink(slug, linkId) {
  const res = await fetch(`${API_BASE}/admin/profiles/${slug}/links/${linkId}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeaders()
    },
  })
  if (!res.ok) throw new Error('Error deleting link')
}

export async function reorderLinks(slug, order) {
  const res = await fetch(`${API_BASE}/admin/profiles/${slug}/reorder`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(order),
  })
  return res.json()
}

export async function getUsers() {
  const res = await fetch(`${API_BASE}/users`, {
    headers: { ...getAuthHeaders() }
  })
  if (!res.ok) throw new Error('Error fetching users')
  return res.json()
}

export async function createUser(data) {
  const res = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Error creating user')
  }
  return res.json()
}

export async function updateUser(userId, data) {
  const res = await fetch(`${API_BASE}/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Error updating user')
  }
  return res.json()
}

export async function deleteUser(userId) {
  const res = await fetch(`${API_BASE}/users/${userId}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() }
  })
  if (!res.ok) throw new Error('Error deleting user')
}

export async function uploadAvatar(userId, file) {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${API_BASE}/users/${userId}/avatar`, {
    method: 'POST',
    headers: { ...getAuthHeaders() },
    body: formData,
  })
  if (!res.ok) throw new Error('Error uploading avatar')
  return res.json()
}
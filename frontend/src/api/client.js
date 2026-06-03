const API_BASE = '/api'

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
  const res = await fetch('/admin/profiles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Error creating profile')
  }
  return res.json()
}

export async function updateProfile(slug, data) {
  const res = await fetch(`/admin/profiles/${slug}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function createLink(slug, data) {
  const res = await fetch(`/admin/profiles/${slug}/links`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Error creating link')
  }
  return res.json()
}

export async function updateLink(slug, linkId, data) {
  const res = await fetch(`/admin/profiles/${slug}/links/${linkId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function deleteLink(slug, linkId) {
  const res = await fetch(`/admin/profiles/${slug}/links/${linkId}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Error deleting link')
}

export async function reorderLinks(slug, order) {
  const res = await fetch(`/admin/profiles/${slug}/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  })
  return res.json()
}
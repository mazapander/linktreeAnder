import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Trash2, GripVertical, Save, BarChart3, Link2 } from 'lucide-react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import * as api from '../api/client'

function SortableLink({ link, onDelete, onUpdate }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: link.id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div ref={setNodeRef} style={style} className="bg-gray-800 rounded-lg p-4 flex items-center gap-3">
      <button {...attributes} {...listeners} className="cursor-grab text-gray-500 hover:text-gray-300">
        <GripVertical size={20} />
      </button>
      <div className="flex-1">
        <input
          type="text"
          value={link.title}
          onChange={(e) => onUpdate(link.id, 'title', e.target.value)}
          className="w-full bg-gray-700 rounded px-3 py-1 text-white mb-1"
          placeholder="Title"
        />
        <input
          type="url"
          value={link.url}
          onChange={(e) => onUpdate(link.id, 'url', e.target.value)}
          className="w-full bg-gray-700 rounded px-3 py-1 text-white text-sm"
          placeholder="URL"
        />
      </div>
      <button onClick={() => onDelete(link.id)} className="text-red-400 hover:text-red-300">
        <Trash2 size={18} />
      </button>
    </div>
  )
}

function AdminDashboard() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newLink, setNewLink] = useState({ title: '', url: '', icon: '' })
  const [stats, setStats] = useState(null)
  const [showStats, setShowStats] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    if (slug) {
      loadProfile()
      loadStats()
    }
    setLoading(false)
  }, [slug])

  const loadProfile = async () => {
    try {
      const data = await api.getProfile(slug)
      setProfile(data)
    } catch (err) {
      setError(err.message)
    }
  }

  const loadStats = async () => {
    try {
      const data = await api.getStats(slug)
      setStats(data)
    } catch (err) {
      console.error('Error loading stats:', err)
    }
  }

  const createProfile = async (e) => {
    e.preventDefault()
    try {
      const data = await api.createProfile({ slug, name: newLink.title || slug })
      setProfile(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleAddLink = async (e) => {
    e.preventDefault()
    if (!profile) return
    try {
      await api.createLink(profile.slug, newLink)
      await loadProfile()
      setNewLink({ title: '', url: '', icon: '' })
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeleteLink = async (linkId) => {
    if (!profile) return
    try {
      await api.deleteLink(profile.slug, linkId)
      await loadProfile()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleUpdateLink = (linkId, field, value) => {
    if (!profile) return
    const updatedLinks = profile.links.map(l =>
      l.id === linkId ? { ...l, [field]: value } : l
    )
    setProfile({ ...profile, links: updatedLinks })
  }

  const handleSaveLink = async (linkId) => {
    if (!profile) return
    const link = profile.links.find(l => l.id === linkId)
    if (!link) return
    try {
      await api.updateLink(profile.slug, linkId, link)
      await loadProfile()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = profile.links.findIndex(l => l.id === active.id)
    const newIndex = profile.links.findIndex(l => l.id === over.id)

    const newLinks = arrayMove(profile.links, oldIndex, newIndex)
    setProfile({ ...profile, links: newLinks })

    const order = {}
    newLinks.forEach((link, index) => { order[link.id] = index })
    try {
      await api.reorderLinks(profile.slug, order)
    } catch (err) {
      setError(err.message)
      await loadProfile()
    }
  }

  if (loading) return <div className="min-h-screen bg-gray-900 text-white p-8">Loading...</div>

  if (!slug) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-6">Create Profile</h1>
          <form onSubmit={createProfile} className="space-y-4">
            <input
              type="text"
              value={slug || ''}
              onChange={(e) => navigate(`/admin/${e.target.value}`)}
              placeholder="Choose your slug"
              className="w-full bg-gray-800 rounded-lg px-4 py-3 text-white"
            />
          </form>
        </div>
      </div>
    )
  }

  if (error && !profile) return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">Create Profile: {slug}</h1>
        <form onSubmit={createProfile} className="space-y-4">
          <input
            type="text"
            value={profile?.name || slug}
            onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Your name"
            className="w-full bg-gray-800 rounded-lg px-4 py-3 text-white"
          />
          <input
            type="text"
            value={profile?.description || ''}
            onChange={(e) => setProfile(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Description (optional)"
            className="w-full bg-gray-800 rounded-lg px-4 py-3 text-white"
          />
          <input
            type="text"
            value={profile?.photo_url || ''}
            onChange={(e) => setProfile(prev => ({ ...prev, photo_url: e.target.value }))}
            placeholder="Photo URL (optional)"
            className="w-full bg-gray-800 rounded-lg px-4 py-3 text-white"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" className="w-full bg-accent hover:bg-pink-600 transition-colors rounded-lg px-4 py-3 font-semibold">
            Create Profile
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">{profile?.name}</h1>
            <p className="text-gray-400">links.anderdata.es/{profile?.slug}</p>
          </div>
          <button
            onClick={() => setShowStats(!showStats)}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 rounded-lg px-4 py-2"
          >
            <BarChart3 size={18} />
            Stats
          </button>
        </div>

        {showStats && stats && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Analytics ({stats.period})</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-400 text-sm">Visits</p>
                <p className="text-3xl font-bold">{stats.total_visits}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Clicks</p>
                <p className="text-3xl font-bold">{stats.total_clicks}</p>
              </div>
            </div>
            {stats.clicks_by_link?.length > 0 && (
              <div>
                <p className="text-gray-400 text-sm mb-2">Clicks by link</p>
                {stats.clicks_by_link.map((c, i) => (
                  <div key={i} className="flex justify-between py-1">
                    <span>{c.title}</span>
                    <span className="font-semibold">{c.clicks}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleAddLink} className="bg-gray-800 rounded-lg p-4 mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Link2 size={18} />
            Add Link
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <input
              type="text"
              value={newLink.title}
              onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
              placeholder="Title"
              className="bg-gray-700 rounded px-3 py-2"
              required
            />
            <input
              type="url"
              value={newLink.url}
              onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
              placeholder="URL"
              className="bg-gray-700 rounded px-3 py-2"
              required
            />
            <input
              type="text"
              value={newLink.icon}
              onChange={(e) => setNewLink({ ...newLink, icon: e.target.value })}
              placeholder="Icon (github, twitter...)"
              className="bg-gray-700 rounded px-3 py-2"
            />
          </div>
          <button type="submit" className="mt-4 flex items-center gap-2 bg-accent hover:bg-pink-600 transition-colors rounded-lg px-4 py-2 font-semibold">
            <Plus size={18} />
            Add
          </button>
        </form>

        <div>
          <h2 className="text-lg font-semibold mb-4">Links</h2>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={profile?.links?.map(l => l.id) || []} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {profile?.links?.map((link) => (
                  <SortableLink
                    key={link.id}
                    link={link}
                    onDelete={handleDeleteLink}
                    onUpdate={handleUpdateLink}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
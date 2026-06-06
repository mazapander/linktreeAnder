import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Edit2, User, Camera, X } from 'lucide-react'
import * as api from '../api/client'

function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({ email: '', password: '', name: '' })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const data = await api.getUsers()
      setUsers(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      let user
      if (editingUser) {
        user = await api.updateUser(editingUser.id, formData)
      } else {
        user = await api.createUser(formData)
      }

      if (avatarFile) {
        await api.uploadAvatar(user.id, avatarFile)
      }

      await loadUsers()
      resetForm()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setFormData({ email: user.email, password: '', name: user.name || '' })
    setAvatarFile(null)
    setAvatarPreview(user.avatar_url || null)
    setShowForm(true)
  }

  const handleDelete = async (userId) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return
    try {
      await api.deleteUser(userId)
      await loadUsers()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingUser(null)
    setFormData({ email: '', password: '', name: '' })
    setAvatarFile(null)
    setAvatarPreview(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (loading) return <div className="text-white">Cargando...</div>

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <User size={20} />
          Gestión de Usuarios
        </h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-accent hover:bg-pink-600 transition-colors rounded-lg px-4 py-2 text-sm font-semibold"
          >
            <Plus size={16} />
            Nuevo Usuario
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 text-red-400 text-sm mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-700 rounded-lg p-4 mb-6 space-y-4">
          <div className="flex items-start gap-6">
            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-full bg-gray-600 overflow-hidden flex items-center justify-center">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={40} className="text-gray-400" />
                )}
              </div>
              <label className="cursor-pointer flex items-center gap-1 text-sm text-gray-300 hover:text-white">
                <Camera size={14} />
                <span>Subir foto</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <div className="flex-1 grid grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-300 text-sm mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-gray-600 rounded px-3 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">
                  Contraseña {editingUser && '(dejar vacío para no cambiar)'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-gray-600 rounded px-3 py-2 text-white"
                  required={!editingUser}
                  minLength={editingUser ? undefined : 6}
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-600 rounded px-3 py-2 text-white"
                  required
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-accent hover:bg-pink-600 transition-colors rounded-lg px-4 py-2 text-sm font-semibold"
            >
              {editingUser ? 'Actualizar' : 'Crear'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-600 hover:bg-gray-500 transition-colors rounded-lg px-4 py-2 text-sm font-semibold"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-gray-700 rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-600 overflow-hidden flex items-center justify-center flex-shrink-0">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.email} className="w-full h-full object-cover" />
                ) : (
                  <User size={24} className="text-gray-400" />
                )}
              </div>
              <div>
                <p className="text-white font-medium">{user.email}</p>
                <p className="text-gray-400 text-sm">
                  Creado: {new Date(user.created_at).toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(user)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-colors"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(user.id)}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-600 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {users.length === 0 && (
          <p className="text-gray-400 text-center py-4">No hay usuarios creados</p>
        )}
      </div>
    </div>
  )
}

export default UserManagement
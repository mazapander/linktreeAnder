import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, X, User } from 'lucide-react'
import * as api from '../api/client'

function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({ email: '', password: '', name: '' })

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
      if (editingUser) {
        await api.updateUser(editingUser.id, formData)
      } else {
        await api.createUser(formData)
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

  const resetForm = () => {
    setShowForm(false)
    setEditingUser(null)
    setFormData({ email: '', password: '', name: '' })
    setError(null)
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
          <div className="grid grid-cols-3 gap-4">
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
            <div>
              <p className="text-white font-medium">{user.email}</p>
              <p className="text-gray-400 text-sm">
                Creado: {new Date(user.created_at).toLocaleDateString('es-ES')}
              </p>
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
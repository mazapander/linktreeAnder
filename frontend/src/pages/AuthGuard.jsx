import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import Login from './Login'

function AuthGuard({ children }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('supabase_token')

      if (!token) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase.auth.getUser(token)

      if (error || !data.user) {
        localStorage.removeItem('supabase_token')
        setLoading(false)
        return
      }

      setIsAuthenticated(true)
      setLoading(false)
    }

    checkAuth()
  }, [navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Login />
  }

  return children
}

export default AuthGuard
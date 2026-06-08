import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import Login from './Login'

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean)

console.log('[AuthGuard] ADMIN_EMAILS configured:', ADMIN_EMAILS.length > 0 ? ADMIN_EMAILS : 'NONE (all users allowed)')

function AuthGuard({ children }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    const checkAuth = async () => {
      console.log('[AuthGuard] Checking authentication...')

      const token = localStorage.getItem('supabase_token')

      if (!token) {
        console.log('[AuthGuard] No token found')
        setLoading(false)
        return
      }

      console.log('[AuthGuard] Token found, verifying with Supabase...')

      try {
        const { data, error } = await supabase.auth.getUser(token)

        if (error) {
          console.error('[AuthGuard] Supabase error:', error.message)
          localStorage.removeItem('supabase_token')
          setAuthError(error.message)
          setLoading(false)
          return
        }

        if (!data.user) {
          console.log('[AuthGuard] No user found in token')
          localStorage.removeItem('supabase_token')
          setLoading(false)
          return
        }

        console.log('[AuthGuard] User found:', data.user.email)

        const userEmail = data.user.email?.toLowerCase() || ''

        if (ADMIN_EMAILS.length > 0 && !ADMIN_EMAILS.includes(userEmail)) {
          console.log('[AuthGuard] User email not in admin list:', userEmail)
          localStorage.removeItem('supabase_token')
          setAuthError('No tienes permisos de administrador')
          setLoading(false)
          return
        }

        console.log('[AuthGuard] Authentication successful')
        setIsAuthenticated(true)
        setLoading(false)
      } catch (err) {
        console.error('[AuthGuard] Unexpected error:', err)
        localStorage.removeItem('supabase_token')
        setAuthError('Error de autenticación')
        setLoading(false)
      }
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
    console.log('[AuthGuard] Not authenticated, showing login')
    return <Login error={authError} />
  }

  return children
}

export default AuthGuard
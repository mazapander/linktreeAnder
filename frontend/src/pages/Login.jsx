import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { LogIn } from 'lucide-react'

function Login({ error: propError }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(propError || '')
  const [loading, setLoading] = useState(false)

  console.log('[Login] Component rendered, supabase url:', import.meta.env.VITE_SUPABASE_URL ? 'SET' : 'NOT SET')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    console.log('[Login] Attempting login for:', email)

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      console.error('[Login] Auth error:', authError.message)
      setError(authError.message)
      setLoading(false)
      return
    }

    if (data?.session) {
      console.log('[Login] Login successful, storing token')
      localStorage.setItem('supabase_token', data.session.access_token)
      navigate('/admin')
    } else {
      console.warn('[Login] No session data returned')
      setError('Error al iniciar sesión')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Login</h1>
          <p className="text-gray-400">Accede para gestionar tu perfil</p>
        </div>

        <form onSubmit={handleLogin} className="bg-gray-800 rounded-lg p-6 space-y-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-gray-300 mb-2 text-sm">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 text-sm">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-pink-600 transition-colors rounded-lg px-4 py-3 font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <LogIn size={18} />
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ExternalLink, Github, Linkedin, Twitter, Globe, Link2 } from 'lucide-react'

const ICONS = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  globe: Globe,
  link: Link2,
  external: ExternalLink,
}

function PublicPage() {
  const { slug } = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
  if (!slug) {
    setLoading(false)
    return
  }

  setLoading(true)

  fetch(`/${slug}`)
    .then(res => {
      if (!res.ok) throw new Error('Profile not found')
      return res.json()
    })
    .then(setProfile)
    .catch(err => setError(err.message))
    .finally(() => setLoading(false))
}, [slug])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-white">
      Loading...
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p>Profile not found</p>
      </div>
    </div>
  )

  if (!profile) return null

  const handleClick = async (link) => {
    try {
      const res = await fetch(`/${slug}/click/${link.id}`)
      const data = await res.json()
      window.location.href = data.url
    } catch (err) {
      window.location.href = link.url
    }
  }

  const getIcon = (iconName) => {
    const Icon = ICONS[iconName] || ExternalLink
    return <Icon size={20} />
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          {profile.photo_url && (
            <img
              src={profile.photo_url}
              alt={profile.name}
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-white/20"
            />
          )}
          <h1 className="text-3xl font-bold text-white mb-2">{profile.name}</h1>
          {profile.description && (
            <p className="text-gray-300">{profile.description}</p>
          )}
        </div>

        <div className="space-y-3">
          {profile.links?.map((link) => (
            <button
              key={link.id}
              onClick={() => handleClick(link)}
              className="w-full bg-white/10 hover:bg-white/20 transition-colors rounded-xl p-4 flex items-center gap-3 text-white"
            >
              {link.icon && getIcon(link.icon)}
              <span className="flex-1 text-left">{link.title}</span>
              <ExternalLink size={18} className="opacity-60" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PublicPage
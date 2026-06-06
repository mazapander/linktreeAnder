import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PublicPage from './pages/PublicPage'
import AdminDashboard from './pages/AdminDashboard'
import AuthGuard from './pages/AuthGuard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/ander" replace />} />
        <Route path="/:slug" element={<PublicPage />} />
        <Route path="/admin" element={<AuthGuard><AdminDashboard /></AuthGuard>} />
        <Route path="/admin/:slug" element={<AuthGuard><AdminDashboard /></AuthGuard>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PublicPage from './pages/PublicPage'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicPage />} />
        <Route path="/:slug" element={<PublicPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/:slug" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
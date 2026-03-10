import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Navbar from '../components/Navbar/Navbar'
import Dashboard from '../pages/Dashboard/Dashboard'
import Login from '../pages/Login/Login'

function Router() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-transparent">
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default Router

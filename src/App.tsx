import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { CreateEntreprisePage } from './pages/CreateEntreprisePage'
import { InvitationAcceptPage } from './pages/InvitationAcceptPage'
import { OffresEmploiPage } from './pages/OffresEmploiPage'
import { OffreDetailPage } from './pages/OffreDetailPage'
import { DashboardConnecte } from './pages/DashboardConnecte'
import { AdminDashboard } from './pages/dashboards/AdminDashboard'
import { DirecteurDashboard } from './pages/dashboards/DirecteurDashboard'
import { RHDashboard } from './pages/dashboards/RHDashboard'
import { EmployeDashboard } from './pages/dashboards/EmployeDashboard'
import { ChatWidget } from './components/chat/ChatWidget'
import { loadDashboardContext } from './services/dashboardData'

function App() {
  useEffect(() => {
    if (localStorage.getItem('auth_token') || localStorage.getItem('token')) {
      void loadDashboardContext()
    }
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/create-entreprise" element={<CreateEntreprisePage />} />
        <Route path="/invitation/:token" element={<InvitationAcceptPage />} />
        <Route path="/offres" element={<OffresEmploiPage />} />
        <Route path="/offres/:id" element={<OffreDetailPage />} />
        <Route path="/dashboard-connecte" element={<DashboardConnecte />} />
        <Route path="/dashboard/admin/*" element={<AdminDashboard />} />
        <Route path="/dashboard/directeur/*" element={<DirecteurDashboard />} />
        <Route path="/dashboard/rh/*" element={<RHDashboard />} />
        <Route path="/dashboard/employe/*" element={<EmployeDashboard />} />
        <Route path="/dashboard" element={<Navigate to="/login" replace />} />
      </Routes>
      
      {/* Assistant virtuel flottant - visible sur toutes les pages */}
      <ChatWidget />
    </BrowserRouter>
  )
}

export default App
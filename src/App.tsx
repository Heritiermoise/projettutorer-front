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
import { NotFoundPage } from './pages/NotFoundPage'
import { ChatWidget } from './components/chat/ChatWidget'
import { ProtectedRoute } from './components/layout/ProtectedRoute'

function App() {
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
        <Route path="/dashboard/admin/*" element={<ProtectedRoute allowedRoles={['admin', 'it']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/directeur/*" element={<ProtectedRoute allowedRoles={['directeur', 'manager']}><DirecteurDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/rh/*" element={<ProtectedRoute allowedRoles={['rh']}><RHDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/employe/*" element={<ProtectedRoute allowedRoles={['employe']}><EmployeDashboard /></ProtectedRoute>} />
        <Route path="/dashboard" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      
      {/* Assistant virtuel flottant - visible sur toutes les pages */}
      <ChatWidget />
    </BrowserRouter>
  )
}

export default App
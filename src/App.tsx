import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { CreateEntreprisePage } from './pages/CreateEntreprisePage'
import { OffresEmploiPage } from './pages/OffresEmploiPage'
import { OffreDetailPage } from './pages/OffreDetailPage'
import { EntreprisePubliquePage } from './pages/EntreprisePubliquePage'
import { AdminDashboard } from './pages/dashboards/AdminDashboard'
import { DirecteurDashboard } from './pages/dashboards/DirecteurDashboard'
import { RHDashboard } from './pages/dashboards/RHDashboard'
import { EmployeDashboard } from './pages/dashboards/EmployeDashboard'
import { UtilisateurDashboard } from './pages/dashboards/UtilisateurDashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/create-entreprise" element={<CreateEntreprisePage />} />
        <Route path="/offres" element={<OffresEmploiPage />} />
        <Route path="/offres/:id" element={<OffreDetailPage />} />
        <Route path="/entreprise/:code" element={<EntreprisePubliquePage />} />
        <Route path="/dashboard/admin/*" element={<AdminDashboard />} />
        <Route path="/dashboard/directeur/*" element={<DirecteurDashboard />} />
        <Route path="/dashboard/rh/*" element={<RHDashboard />} />
        <Route path="/dashboard/employe/*" element={<EmployeDashboard />} />
        <Route path="/dashboard/utilisateur/*" element={<UtilisateurDashboard />} />
        <Route path="/dashboard" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
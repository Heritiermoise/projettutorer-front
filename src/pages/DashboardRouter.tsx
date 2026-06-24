import { Routes, Route, Navigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { AdminDashboard } from './dashboards/AdminDashboard';
import { DirecteurDashboard } from './dashboards/DirecteurDashboard';
import { RHDashboard } from './dashboards/RHDashboard';
import { EmployeDashboard } from './dashboards/EmployeDashboard';

export const DashboardRouter = () => {
  const user = authService.getCurrentUser();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={
        user.role === 'admin' ? <AdminDashboard /> :
        user.role === 'directeur' ? <DirecteurDashboard /> :
        user.role === 'rh' ? <RHDashboard /> :
        <EmployeDashboard />
      } />
      <Route path="/admin/*" element={<AdminDashboard />} />
      <Route path="/directeur/*" element={<DirecteurDashboard />} />
      <Route path="/rh/*" element={<RHDashboard />} />
      <Route path="/employe/*" element={<EmployeDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
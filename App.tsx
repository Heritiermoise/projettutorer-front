import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { MainLayout } from './components/layout/MainLayout';
import { useAuth } from './hooks/useAuth';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, roles }: { children: React.ReactNode, roles?: string[] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        
        {/* Admin Routes */}
        <Route path="admin/*" element={
          <ProtectedRoute roles={['admin']}>
            <DashboardPage />
          </ProtectedRoute>
        } />
        
        {/* Directeur Routes */}
        <Route path="direction/*" element={
          <ProtectedRoute roles={['directeur']}>
            <DashboardPage />
          </ProtectedRoute>
        } />
        
        {/* RH Routes */}
        <Route path="rh/*" element={
          <ProtectedRoute roles={['rh']}>
            <DashboardPage />
          </ProtectedRoute>
        } />
        
        {/* Employe Routes */}
        <Route path="employe/*" element={
          <ProtectedRoute roles={['employe']}>
            <DashboardPage />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
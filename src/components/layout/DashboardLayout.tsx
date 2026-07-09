import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Building2, FileText, Calendar, DollarSign, 
  Briefcase, LogOut, Menu, X, UserCog, User, 
  Shield, Server, Bell, Moon, Sun
} from 'lucide-react';
import { clearDashboardContextCache } from '../../services/dashboardData';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: string;
  userName: string;
  onLogout: () => void;
}

export const DashboardLayout = ({ children, userRole, userName, onLogout }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleDark = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const menuItems: Record<string, Array<{ icon: any; label: string; path: string }>> = {
    admin: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard/admin' },
      { icon: Building2, label: 'Entreprises', path: '/dashboard/admin/entreprises' },
      { icon: Users, label: 'Utilisateurs', path: '/dashboard/admin/users' },
      { icon: Shield, label: 'Sécurité', path: '/dashboard/admin/securite' },
      { icon: Server, label: 'Système', path: '/dashboard/admin/systeme' },
    ],
    directeur: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard/directeur' },
      { icon: Building2, label: 'Mon Entreprise', path: '/dashboard/directeur/entreprise' },
      { icon: Users, label: 'Membres', path: '/dashboard/directeur/membres' },
      { icon: Briefcase, label: 'Services', path: '/dashboard/directeur/services' },
      { icon: FileText, label: 'Postes', path: '/dashboard/directeur/postes' },
      { icon: Calendar, label: 'Statistiques', path: '/dashboard/directeur/stats' },
      { icon: FileText, label: 'Rapports', path: '/dashboard/directeur/rapports' },
    ],
    rh: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard/rh' },
      { icon: Users, label: 'Employés', path: '/dashboard/rh/employes' },
      { icon: FileText, label: 'Contrats', path: '/dashboard/rh/contrats' },
      { icon: DollarSign, label: 'Paie', path: '/dashboard/rh/paies' },
      { icon: Calendar, label: 'Congés', path: '/dashboard/rh/conges' },
      { icon: UserCog, label: 'Présences', path: '/dashboard/rh/presences' },
      { icon: Briefcase, label: 'Avantages', path: '/dashboard/rh/avantages' },
      { icon: FileText, label: 'Documents', path: '/dashboard/rh/documents' },
      { icon: UserCog, label: 'Recrutement', path: '/dashboard/rh/recrutement' },
    ],
    employe: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard/employe' },
      { icon: DollarSign, label: 'Mes Paies', path: '/dashboard/employe/paies' },
      { icon: Calendar, label: 'Mes Congés', path: '/dashboard/employe/conges' },
      { icon: UserCog, label: 'Mes Présences', path: '/dashboard/employe/presences' },
      { icon: FileText, label: 'Mes Documents', path: '/dashboard/employe/documents' },
      { icon: Briefcase, label: 'Mes Avantages', path: '/dashboard/employe/avantages' },
    ],
  };

  const items = menuItems[userRole] || menuItems.employe;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    clearDashboardContextCache();
    onLogout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50
        w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                  RH Pro
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{userRole}</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {items.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-xl transition-all
                    ${isActive 
                      ? 'bg-gradient-to-r from-primary-500 to-accent-600 text-white shadow-lg shadow-primary-500/20' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:pl-64">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center space-x-4 ml-auto">
              <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 relative">
                <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <button
                onClick={toggleDark}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
              </button>

              <div className="flex items-center space-x-3 pl-4 border-l border-slate-200 dark:border-slate-700">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center shadow-sm">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <p className="font-semibold text-slate-800 dark:text-white text-sm">{userName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{userRole}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, FileText, Calendar, DollarSign, LogOut, X } from 'lucide-react';

interface SidebarProps {
  userRole: string;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ userRole, onLogout, isOpen, onClose }: SidebarProps) => {
  const location = useLocation();

  const menuItems: any = {
    admin: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/app/dashboard' },
      { icon: Building2, label: 'Entreprises', path: '/app/dashboard' },
      { icon: Users, label: 'Utilisateurs', path: '/app/dashboard' },
    ],
    directeur: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/app/dashboard' },
      { icon: Building2, label: 'Mon Entreprise', path: '/app/dashboard' },
      { icon: Users, label: 'Employes', path: '/app/dashboard' },
      { icon: FileText, label: 'Rapports', path: '/app/dashboard' },
    ],
    rh: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/app/dashboard' },
      { icon: Users, label: 'Employes', path: '/app/dashboard' },
      { icon: FileText, label: 'Contrats', path: '/app/dashboard' },
      { icon: DollarSign, label: 'Paie', path: '/app/dashboard' },
      { icon: Calendar, label: 'Conges', path: '/app/dashboard' },
    ],
    employe: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/app/dashboard' },
      { icon: DollarSign, label: 'Mes Paies', path: '/app/dashboard' },
      { icon: Calendar, label: 'Mes Conges', path: '/app/dashboard' },
      { icon: FileText, label: 'Documents', path: '/app/dashboard' },
    ],
  };

  const items = menuItems[userRole] || menuItems.employe;

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={
        'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white ' +
        'transform transition-transform duration-300 ease-in-out ' +
        (isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')
      }>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">RH Pro</span>
            </div>
            <button onClick={onClose} className="lg:hidden">
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {items.map((item: any, idx: number) => (
              <Link
                key={idx}
                to={item.path}
                onClick={onClose}
                className={
                  'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ' +
                  (location.pathname === item.path
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white')
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Deconnexion</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
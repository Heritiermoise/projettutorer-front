import { User, Menu } from 'lucide-react';

interface HeaderProps {
  user: any;
  onMenuClick: () => void;
}

export const Header = ({ user, onMenuClick }: HeaderProps) => {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex items-center space-x-4 ml-auto">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="font-semibold text-slate-800">
                {user?.prenom} {user?.nom}
              </p>
              <p className="text-sm text-slate-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
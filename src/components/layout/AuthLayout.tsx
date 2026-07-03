import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Building2, Menu, X, Moon, Sun, LogIn, UserPlus, Briefcase, Home } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  const [isDark, setIsDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const toggleDark = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-accent-50/30 dark:from-slate-900 dark:via-primary-900/10 dark:to-accent-900/10">
        {/* NAVBAR FIXE */}
        <nav className={
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ' +
          (scrolled 
            ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-lg border-b border-slate-200 dark:border-slate-800' 
            : 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50')
        }>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 sm:h-20">
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                    RH Pro
                  </span>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 -mt-1 hidden sm:block">Enterprise Suite</p>
                </div>
              </Link>

              {/* Navigation Desktop */}
              <div className="hidden lg:flex items-center space-x-6">
                <Link to="/" className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
                  <Home className="w-4 h-4" />
                  <span>Accueil</span>
                </Link>
                <Link to="/login" className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
                  <LogIn className="w-4 h-4" />
                  <span>Connexion</span>
                </Link>
                <Link to="/register" className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
                  <UserPlus className="w-4 h-4" />
                  <span>Inscription</span>
                </Link>
                <Link to="/create-entreprise" className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-warm-500 to-warm-600 hover:from-warm-600 hover:to-warm-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5">
                  <Briefcase className="w-4 h-4" />
                  <span>Creer entreprise</span>
                </Link>
              </div>

              {/* Actions Desktop */}
              <div className="hidden lg:flex items-center space-x-3">
                <button
                  onClick={toggleDark}
                  className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  aria-label="Toggle dark mode"
                >
                  {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
                </button>
              </div>

              {/* Menu Mobile Button */}
              <div className="flex lg:hidden items-center space-x-2">
                <button
                  onClick={toggleDark}
                  className="p-2 rounded-full bg-slate-100 dark:bg-slate-800"
                >
                  {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
                </button>
                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>

          {/* Menu Mobile */}
          {mobileOpen && (
            <div className="lg:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-2xl">
              <div className="px-4 py-4 space-y-2">
                <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center space-x-3 text-slate-600 dark:text-slate-300 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 font-medium py-3 px-4 rounded-lg transition-colors">
                  <Home className="w-5 h-5" />
                  <span>Accueil</span>
                </Link>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="flex items-center space-x-3 text-slate-600 dark:text-slate-300 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 font-medium py-3 px-4 rounded-lg transition-colors">
                  <LogIn className="w-5 h-5" />
                  <span>Connexion</span>
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="flex items-center space-x-3 text-slate-600 dark:text-slate-300 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 font-medium py-3 px-4 rounded-lg transition-colors">
                  <UserPlus className="w-5 h-5" />
                  <span>Inscription</span>
                </Link>
                <Link to="/create-entreprise" onClick={() => setMobileOpen(false)} className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-warm-500 to-warm-600 text-white font-semibold rounded-lg shadow-lg">
                  <Briefcase className="w-5 h-5" />
                  <span>Creer mon entreprise</span>
                </Link>
              </div>
            </div>
          )}
        </nav>

        {/* Content */}
        <div className="pt-20 pb-12">
          {children}
        </div>
      </div>
    </div>
  );
};
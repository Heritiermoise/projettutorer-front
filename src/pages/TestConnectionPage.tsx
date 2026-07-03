import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { testBackendConnection } from '../services/api';
import { CheckCircle2, XCircle, Loader2, Wifi, WifiOff } from 'lucide-react';

export const TestConnectionPage = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setStatus('loading');
    const result = await testBackendConnection();
    
    if (result.success) {
      setStatus('success');
      setMessage(result.message);
    } else {
      setStatus('error');
      setMessage(result.message);
    }
  };

  return (
    <AuthLayout>
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl shadow-2xl mb-4">
              {status === 'loading' && <Loader2 className="w-8 h-8 text-white animate-spin" />}
              {status === 'success' && <CheckCircle2 className="w-8 h-8 text-white" />}
              {status === 'error' && <XCircle className="w-8 h-8 text-white" />}
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2">
              Test de Connexion Backend
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Verification de la connexion au backend herberge
            </p>
          </div>

          <div className="space-y-4">
            <div className={`p-4 rounded-xl border-2 ${
              status === 'loading' ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800' :
              status === 'success' ? 'bg-accent-50 dark:bg-accent-900/20 border-accent-200 dark:border-accent-800' :
              'bg-warm-50 dark:bg-warm-900/20 border-warm-200 dark:border-warm-800'
            }`}>
              <div className="flex items-start space-x-3">
                {status === 'loading' && <Wifi className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5 animate-pulse" />}
                {status === 'success' && <Wifi className="w-5 h-5 text-accent-600 dark:text-accent-400 flex-shrink-0 mt-0.5" />}
                {status === 'error' && <WifiOff className="w-5 h-5 text-warm-600 dark:text-warm-400 flex-shrink-0 mt-0.5" />}
                <div>
                  <p className={`font-semibold ${
                    status === 'loading' ? 'text-primary-800 dark:text-primary-200' :
                    status === 'success' ? 'text-accent-800 dark:text-accent-200' :
                    'text-warm-800 dark:text-warm-200'
                  }`}>
                    {status === 'loading' && 'Test en cours...'}
                    {status === 'success' && 'Connexion reussie !'}
                    {status === 'error' && 'Erreur de connexion'}
                  </p>
                  <p className={`text-sm mt-1 ${
                    status === 'loading' ? 'text-primary-600 dark:text-primary-300' :
                    status === 'success' ? 'text-accent-600 dark:text-accent-300' :
                    'text-warm-600 dark:text-warm-300'
                  }`}>
                    {message}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">URL du backend :</p>
              <code className="text-xs text-slate-600 dark:text-slate-400 break-all">
                https://rhmanager-877l.onrender.com/Api/
              </code>
            </div>

            <button
              onClick={testConnection}
              disabled={status === 'loading'}
              className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 via-purple-600 to-accent-600 hover:from-primary-700 hover:via-purple-700 hover:to-accent-700 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all disabled:opacity-50"
            >
              {status === 'loading' ? 'Test en cours...' : 'Re-tester la connexion'}
            </button>

            {status === 'success' && (
              <div className="space-y-3">
                <Link
                  to="/login"
                  className="block w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white font-bold rounded-xl shadow-lg text-center"
                >
                  Aller a la page de connexion
                </Link>
                <Link
                  to="/register"
                  className="block w-full py-3 px-4 border-2 border-primary-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 font-bold rounded-xl text-center"
                >
                  Creer un compte
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 via-purple-500 to-accent-500 rounded-2xl shadow-2xl mb-4">
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
              status === 'loading' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' :
              status === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
              'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-start space-x-3">
                {status === 'loading' && <Wifi className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5 animate-pulse" />}
                {status === 'success' && <Wifi className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />}
                {status === 'error' && <WifiOff className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />}
                <div>
                  <p className={`font-semibold ${
                    status === 'loading' ? 'text-blue-800 dark:text-blue-200' :
                    status === 'success' ? 'text-green-800 dark:text-green-200' :
                    'text-red-800 dark:text-red-200'
                  }`}>
                    {status === 'loading' && 'Test en cours...'}
                    {status === 'success' && 'Connexion reussie !'}
                    {status === 'error' && 'Erreur de connexion'}
                  </p>
                  <p className={`text-sm mt-1 ${
                    status === 'loading' ? 'text-blue-600 dark:text-blue-300' :
                    status === 'success' ? 'text-green-600 dark:text-green-300' :
                    'text-red-600 dark:text-red-300'
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
                  className="block w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg text-center"
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
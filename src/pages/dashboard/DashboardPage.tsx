import { useAuth } from '../../hooks/useAuth';
import { Users, Building2, TrendingUp, Calendar, DollarSign, FileText } from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();

  const stats = [
    { icon: Users, label: 'Total Employes', value: '142', color: 'from-blue-500 to-blue-600', change: '+12%' },
    { icon: Building2, label: 'Services', value: '8', color: 'from-purple-500 to-purple-600', change: '+2' },
    { icon: DollarSign, label: 'Masse salariale', value: '$245K', color: 'from-green-500 to-green-600', change: '+8%' },
    { icon: Calendar, label: 'Conges ce mois', value: '12', color: 'from-orange-500 to-orange-600', change: '-3' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Tableau de bord
        </h1>
        <p className="text-slate-600">
          Bienvenue, {user?.prenom} {user?.nom}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={
                'w-12 h-12 bg-gradient-to-br ' + stat.color + 
                ' rounded-xl flex items-center justify-center'
              }>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-semibold text-green-600">{stat.change}</span>
            </div>
            <p className="text-sm font-medium text-slate-600 mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Activite recente</h2>
          <div className="space-y-4">
            {[
              { icon: FileText, text: 'Nouveau contrat signe', time: 'Il y a 2h', color: 'bg-green-100 text-green-600' },
              { icon: Users, text: '3 nouveaux employes', time: 'Il y a 5h', color: 'bg-blue-100 text-blue-600' },
              { icon: Calendar, text: 'Conge approuve', time: 'Hier', color: 'bg-purple-100 text-purple-600' },
            ].map((item, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className={
                  'w-10 h-10 rounded-full flex items-center justify-center ' + item.color
                }>
                  <item.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-800">{item.text}</p>
                  <p className="text-sm text-slate-500">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Actions rapides</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Users, label: 'Ajouter employe', color: 'from-primary-500 to-primary-600' },
              { icon: FileText, label: 'Nouveau contrat', color: 'from-accent-500 to-accent-600' },
              { icon: DollarSign, label: 'Generer paie', color: 'from-green-500 to-green-600' },
              { icon: Calendar, label: 'Voir conges', color: 'from-purple-500 to-purple-600' },
            ].map((action, i) => (
              <button
                key={i}
                className={
                  'flex flex-col items-center justify-center p-6 bg-gradient-to-br ' + 
                  action.color + ' text-white rounded-xl hover:shadow-lg transition-all'
                }
              >
                <action.icon className="w-8 h-8 mb-2" />
                <span className="text-sm font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
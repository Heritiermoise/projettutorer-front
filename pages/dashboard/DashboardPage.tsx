import { useAuth } from '../../hooks/useAuth';
import { Users, Building2, TrendingUp, Calendar } from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();

  const stats = [
    { icon: Users, label: 'Total Employés', value: '0', color: 'from-blue-500 to-blue-600' },
    { icon: Building2, label: 'Services', value: '0', color: 'from-purple-500 to-purple-600' },
    { icon: TrendingUp, label: 'Recrutements', value: '0', color: 'from-green-500 to-green-600' },
    { icon: Calendar, label: 'Congés ce mois', value: '0', color: 'from-orange-500 to-orange-600' },
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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Activité récente</h2>
          <p className="text-slate-600">Aucune activité récente</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Notifications</h2>
          <p className="text-slate-600">Aucune notification</p>
        </div>
      </div>
    </div>
  );
};
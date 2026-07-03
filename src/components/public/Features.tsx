import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  FileText, Calendar, DollarSign, UserCheck,
  Briefcase, Shield, BarChart3, Bell, Zap, Lock
} from 'lucide-react';

export const Features = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  const features = [
    { icon: Briefcase, title: "Recrutement intelligent", description: "Publiez des offres, recevez les candidatures, planifiez des entretiens.", color: "from-primary-500 to-primary-700", stats: "150+ candidatures/mois" },
    { icon: FileText, title: "Gestion des contrats", description: "Creez, signez et archivez tous vos contrats. Renouvellements automatiques.", color: "from-accent-500 to-accent-700", stats: "100% digital" },
    { icon: DollarSign, title: "Paie automatisee", description: "Calculez les salaires, gerez les primes et avantages. Bulletins generes automatiquement.", color: "from-warm-500 to-warm-600", stats: "Gain de 80% de temps" },
    { icon: Calendar, title: "Conges & Absences", description: "Demandes de conges en ligne, validation en un clic, calendrier partage.", color: "from-slate-500 to-slate-700", stats: "Zero papier" },
    { icon: UserCheck, title: "Presences & Pointage", description: "Pointage quotidien, suivi des retards et absences. Statistiques en temps reel.", color: "from-primary-500 to-accent-500", stats: "Temps reel" },
    { icon: BarChart3, title: "Rapports & Statistiques", description: "Tableaux de bord personnalises, KPIs, export PDF/Excel.", color: "from-accent-500 to-primary-600", stats: "+50 indicateurs" },
    { icon: Shield, title: "Securite maximale", description: "Chiffrement de bout en bout, sauvegardes automatiques, conformite RGPD.", color: "from-slate-600 to-slate-800", stats: "99.9% uptime" },
    { icon: Bell, title: "Notifications intelligentes", description: "Alertes personnalisees pour les echeances, anniversaires, fin de contrat.", color: "from-primary-600 to-accent-600", stats: "Multi-canaux" },
    { icon: Zap, title: "Automatisation puissante", description: "Workflows automatises, taches recurrentes, rappels intelligents.", color: "from-warm-400 to-warm-600", stats: "100+ automatisations" }
  ];

  return (
    <section id="fonctionnalites" className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-100/30 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 bg-accent-50 px-4 py-2 rounded-full mb-4">
            <Zap className="w-4 h-4 text-accent-600" />
            <span className="text-sm font-semibold text-accent-700">Tout inclus</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-4">
            Toutes les fonctionnalites
            <br />
            <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              dont vous avez besoin
            </span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="relative bg-white rounded-2xl p-8 h-full border border-slate-100 hover:border-primary-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="relative mb-6">
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-primary-700 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed mb-4">{feature.description}</p>

                <div className="inline-flex items-center space-x-2 bg-slate-50 group-hover:bg-primary-50 px-3 py-1.5 rounded-full transition-colors">
                  <div className="w-1.5 h-1.5 bg-accent-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-semibold text-slate-600 group-hover:text-primary-700">
                    {feature.stats}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden"
        >
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Lock className="w-5 h-5" />
                <span className="text-sm font-semibold text-white/80">Securite Enterprise</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                Vos donnees sont protegees comme dans un coffre-fort
              </h3>
              <p className="text-white/80 text-lg">
                Chiffrement AES-256, sauvegardes quotidiennes, serveurs securises.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Uptime", value: "99.9%" },
                { label: "Chiffrement", value: "AES-256" },
                { label: "Sauvegardes", value: "Quotidiennes" },
                { label: "Support", value: "24/7" },
              ].map((item, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold mb-1">{item.value}</div>
                  <div className="text-sm text-white/70">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

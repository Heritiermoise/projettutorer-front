import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Crown, UserCog, Users, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Roles = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  const roles = [
    {
      icon: Crown,
      title: "Directeur / CEO",
      subtitle: "Vision strategique",
      description: "Tableau de bord executif complet. Visualisez les KPIs, la masse salariale, les effectifs par service.",
      features: [
        "Dashboard executif temps reel",
        "Rapports financiers detailles",
        "Vue d'ensemble de l'entreprise",
        "Statistiques avancees"
      ],
      color: "from-warm-400 to-warm-600",
      bgColor: "bg-gradient-to-br from-warm-50 to-white",
      borderColor: "border-warm-100",
      textColor: "text-warm-700"
    },
    {
      icon: UserCog,
      title: "Ressources Humaines",
      subtitle: "Gestion quotidienne",
      description: "Tous les outils RH dans une seule interface. Recrutement, contrats, paie, conges.",
      features: [
        "Gestion complete des employes",
        "Recrutement et onboarding",
        "Gestion de la paie",
        "Suivi des contrats et documents"
      ],
      color: "from-primary-500 to-primary-700",
      bgColor: "bg-gradient-to-br from-primary-50 to-white",
      borderColor: "border-primary-200",
      textColor: "text-primary-700",
      popular: true
    },
    {
      icon: Users,
      title: "Manager",
      subtitle: "Management d'equipe",
      description: "Gerez votre equipe efficacement. Validez les conges, suivez les presences.",
      features: [
        "Validation des conges",
        "Suivi des presences",
        "Gestion d'equipe",
        "Evaluations performance"
      ],
      color: "from-accent-500 to-accent-700",
      bgColor: "bg-gradient-to-br from-accent-50 to-white",
      borderColor: "border-accent-200",
      textColor: "text-accent-700"
    },
    {
      icon: User,
      title: "Employe",
      subtitle: "Espace personnel",
      description: "Accedez a votre espace personnel. Consultez vos fiches de paie, demandez des conges.",
      features: [
        "Fiches de paie en ligne",
        "Demande de conges",
        "Documents personnels",
        "Messagerie RH"
      ],
      color: "from-slate-500 to-slate-700",
      bgColor: "bg-gradient-to-br from-slate-50 to-white",
      borderColor: "border-slate-200",
      textColor: "text-slate-700"
    }
  ];

  return (
    <section id="roles" className="py-24 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 bg-primary-50 px-4 py-2 rounded-full mb-4">
            <Users className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-semibold text-primary-700">Pour chaque role</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-4">
            Une interface adaptee
            <br />
            <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              a chaque utilisateur
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Chaque membre de votre entreprise dispose d'un espace personnalise
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {roles.map((role, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="relative group"
            >
              {role.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                    LE PLUS UTILISE
                  </div>
                </div>
              )}

              <div className={`relative ${role.bgColor} rounded-3xl p-8 h-full border-2 ${role.borderColor} group-hover:shadow-2xl transition-all duration-300 overflow-hidden`}>
                <div className={`absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br ${role.color} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`}></div>

                <div className="relative">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${role.color} rounded-2xl shadow-lg mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                        <role.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-800 mb-1">
                        {role.title}
                      </h3>
                      <p className={`text-sm font-semibold ${role.textColor}`}>
                        {role.subtitle}
                      </p>
                    </div>
                  </div>

                  <p className="text-slate-600 leading-relaxed mb-6">
                    {role.description}
                  </p>

                  <ul className="space-y-3 mb-8">
                    {role.features.map((feature, i) => (
                      <li key={i} className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br ${role.color} flex items-center justify-center mt-0.5`}>
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/login"
                    className={`inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r ${role.color} text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 group/btn`}
                  >
                    <span>Acceder a l'espace</span>
                    <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
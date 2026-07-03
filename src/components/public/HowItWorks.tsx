import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { UserPlus, Building2, Users, Rocket, CheckCircle2 } from 'lucide-react';

export const HowItWorks = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  const steps = [
    {
      icon: UserPlus,
      title: "Inscrivez votre entreprise",
      description: "Creez votre espace en moins de 2 minutes. Renseignez les informations de base.",
      color: "from-primary-500 to-primary-600",
      bgColor: "bg-primary-50",
      number: "01"
    },
    {
      icon: Building2,
      title: "Configurez votre structure",
      description: "Definissez vos departements, services et postes selon votre organisation.",
      color: "from-accent-500 to-accent-600",
      bgColor: "bg-accent-50",
      number: "02"
    },
    {
      icon: Users,
      title: "Invitez votre equipe",
      description: "Ajoutez vos employes, attribuez les roles et personnalisez les acces.",
      color: "from-warm-500 to-warm-600",
      bgColor: "bg-warm-50",
      number: "03"
    },
    {
      icon: Rocket,
      title: "Gerez tout simplement",
      description: "Recrutement, contrats, paie, conges : tout est centralise et automatise.",
      color: "from-slate-500 to-slate-700",
      bgColor: "bg-slate-50",
      number: "04"
    }
  ];

  return (
    <section id="comment" className="py-24 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 bg-primary-50 px-4 py-2 rounded-full mb-4">
            <CheckCircle2 className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-semibold text-primary-700">Simple et rapide</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-4">
            Comment ca marche ?
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            En 4 etapes simples, transformez la gestion de votre entreprise
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-200 via-accent-200 to-primary-200"></div>

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 h-full group hover:-translate-y-2">
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-slate-100">
                  <span className="text-sm font-bold text-slate-400">{step.number}</span>
                </div>

                <div className={`w-16 h-16 ${step.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <div className={`w-12 h-12 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-800 mb-3">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

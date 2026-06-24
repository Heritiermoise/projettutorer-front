import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CTA = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="py-24 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 rounded-3xl p-12 md:p-16 text-center shadow-2xl overflow-hidden"
        >
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-sm font-semibold text-white">Pret a commencer ?</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight"
            >
              Transformez votre gestion RH
              <br />
              <span className="text-accent-300">des aujourd'hui</span>
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-10"
            >
              <Link
                to="/register"
                className="group inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-slate-50 text-primary-700 font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <span>Creer mon entreprise</span>
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold rounded-full border-2 border-white/30 hover:border-white/50 transition-all duration-300"
              >
                Se connecter
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap justify-center gap-6 text-sm text-white/80"
            >
              {["Configuration gratuite", "Sans engagement", "Support 24/7", "Securite maximale"].map((item, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-accent-300" />
                  <span>{item}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

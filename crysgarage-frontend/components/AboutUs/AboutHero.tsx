import React from 'react';
import { motion } from 'framer-motion';

const AboutHero: React.FC = () => {
  return (
    <section className="relative overflow-hidden pt-8 pb-20 px-4">
      {/* Background is now handled by parent component */}
      
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`bg-wave-${i}`}
            className="absolute h-px bg-gradient-to-r from-transparent via-crys-gold to-transparent"
            style={{
              width: `${40 + i * 15}%`,
              top: `${20 + i * 15}%`,
              left: `${-10 + i * 5}%`,
            }}
            animate={{
              x: ['-100%', '100%'],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 5 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold text-crys-gold mb-6">
            About Crysgarage
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Revolutionizing audio mastering through the Crys Garage Engine and real-time processing
          </p>
          <div className="w-24 h-1 bg-crys-gold mx-auto mb-8"></div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid md:grid-cols-3 gap-8 mt-16"
        >
          <div className="bg-crys-graphite/30 rounded-xl p-6 backdrop-blur-sm border border-crys-gold/10">
            <div className="text-3xl mb-4">🎵</div>
                            <h3 className="text-xl font-semibold text-crys-gold mb-2">Crys Garage Engine-Powered</h3>
                          <p className="text-gray-300">Advanced Crys Garage Engine algorithms for professional-grade mastering</p>
          </div>
          
          <div className="bg-crys-graphite/30 rounded-xl p-6 backdrop-blur-sm border border-crys-gold/10">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold text-crys-gold mb-2">Real-Time</h3>
            <p className="text-gray-300">Instant processing and preview with live genre switching</p>
          </div>
          
          <div className="bg-crys-graphite/30 rounded-xl p-6 backdrop-blur-sm border border-crys-gold/10">
            <div className="text-3xl mb-4">🌍</div>
            <h3 className="text-xl font-semibold text-crys-gold mb-2">Accessible</h3>
            <p className="text-gray-300">Professional mastering accessible to artists worldwide</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutHero;

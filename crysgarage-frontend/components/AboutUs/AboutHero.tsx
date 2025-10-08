import React from 'react';
import { motion } from 'framer-motion';
import { Music, Zap, Globe, Award, Users, TrendingUp } from 'lucide-react';

const AboutHero: React.FC = () => {
  return (
    <section className="relative overflow-hidden pt-20 pb-32 px-4">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`bg-wave-${i}`}
            className="absolute h-px bg-gradient-to-r from-transparent via-crys-gold to-transparent"
            style={{
              width: `${30 + i * 8}%`,
              top: `${10 + i * 8}%`,
              left: `${-5 + i * 3}%`,
            }}
            animate={{
              x: ['-100%', '100%'],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 8 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-crys-gold/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Main hero content */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-block mb-8"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-crys-gold to-crys-gold-muted rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-crys-gold/20">
              <Music className="w-10 h-10 text-black" />
            </div>
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-crys-gold via-crys-gold-muted to-crys-gold bg-clip-text text-transparent mb-8 leading-tight">
            About Crysgarage
          </h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-2xl md:text-3xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
          >
            Revolutionizing audio mastering through the 
            <span className="text-crys-gold font-semibold"> Crys Garage Engine</span> and 
            <span className="text-crys-gold font-semibold"> real-time processing</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex items-center justify-center gap-4 mb-16"
          >
            <div className="w-16 h-1 bg-gradient-to-r from-transparent to-crys-gold"></div>
            <div className="w-3 h-3 bg-crys-gold rounded-full"></div>
            <div className="w-16 h-1 bg-gradient-to-l from-transparent to-crys-gold"></div>
          </motion.div>
        </motion.div>

        {/* Enhanced feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ duration: 0.3 }}
            className="group bg-gradient-to-br from-crys-graphite/40 to-crys-graphite/20 rounded-2xl p-8 backdrop-blur-sm border border-crys-gold/20 hover:border-crys-gold/40 transition-all duration-300"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-crys-gold/20 to-crys-gold/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Music className="w-8 h-8 text-crys-gold" />
            </div>
            <h3 className="text-2xl font-bold text-crys-gold mb-4">Crys Garage Engine</h3>
            <p className="text-gray-300 text-lg leading-relaxed">
              Advanced proprietary algorithms delivering studio-quality mastering with unprecedented precision and speed.
            </p>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ duration: 0.3 }}
            className="group bg-gradient-to-br from-crys-graphite/40 to-crys-graphite/20 rounded-2xl p-8 backdrop-blur-sm border border-crys-gold/20 hover:border-crys-gold/40 transition-all duration-300"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-crys-gold/20 to-crys-gold/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-8 h-8 text-crys-gold" />
            </div>
            <h3 className="text-2xl font-bold text-crys-gold mb-4">Real-Time Processing</h3>
            <p className="text-gray-300 text-lg leading-relaxed">
              Instant preview and processing with live genre switching, giving you immediate feedback on your sound.
            </p>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ duration: 0.3 }}
            className="group bg-gradient-to-br from-crys-graphite/40 to-crys-graphite/20 rounded-2xl p-8 backdrop-blur-sm border border-crys-gold/20 hover:border-crys-gold/40 transition-all duration-300"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-crys-gold/20 to-crys-gold/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Globe className="w-8 h-8 text-crys-gold" />
            </div>
            <h3 className="text-2xl font-bold text-crys-gold mb-4">Global Accessibility</h3>
            <p className="text-gray-300 text-lg leading-relaxed">
              Professional mastering accessible to artists worldwide, breaking down geographical and financial barriers.
            </p>
          </motion.div>
        </motion.div>

        {/* Stats section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { icon: Users, label: "Active Users", value: "100+" },
            { icon: Music, label: "Tracks Mastered", value: "500+" },
            { icon: Award, label: "Awards Won", value: "0" },
            { icon: TrendingUp, label: "Success Rate", value: "—" }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1.4 + index * 0.1 }}
              className="text-center"
            >
              <div className="w-12 h-12 bg-crys-gold/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-6 h-6 text-crys-gold" />
              </div>
              <div className="text-3xl font-bold text-crys-gold mb-2">{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AboutHero;

import React from 'react';
import { motion } from 'framer-motion';
import { Target, Lightbulb, Users, Globe, Heart, Shield, Zap } from 'lucide-react';

const VisionMission: React.FC = () => {
  return (
    <section className="py-24 px-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #D4AF37 2px, transparent 2px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="inline-block mb-8"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-crys-gold to-crys-gold-muted rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-crys-gold/20">
              <Target className="w-8 h-8 text-black" />
            </div>
          </motion.div>

          <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-crys-gold via-crys-gold-muted to-crys-gold bg-clip-text text-transparent mb-8">
            Our Vision & Mission
          </h2>
          <p className="text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Empowering artists worldwide with professional-grade audio mastering technology
          </p>
        </motion.div>

        {/* Vision & Mission Cards */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          {/* Vision */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="group"
          >
            <div className="bg-gradient-to-br from-crys-graphite/40 to-crys-graphite/20 rounded-3xl p-10 backdrop-blur-sm border border-crys-gold/20 hover:border-crys-gold/40 transition-all duration-500 h-full">
              <div className="flex items-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-crys-gold/20 to-crys-gold/10 rounded-2xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-8 h-8 text-crys-gold" />
                </div>
                <h3 className="text-3xl font-bold text-crys-gold">Our Vision</h3>
              </div>
              
              <p className="text-gray-300 text-xl leading-relaxed mb-8">
                To democratize professional audio mastering by making studio-quality processing accessible to every artist, 
                producer, and content creator worldwide. We envision a future where geographical and financial barriers 
                no longer limit creative expression.
              </p>
              
              <div className="space-y-4">
                {[
                  "Global accessibility to professional mastering tools",
                  "Real-time collaboration and instant feedback", 
                  "Crys Garage Engine-powered optimization for every genre and style"
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start group/item"
                  >
                    <div className="w-6 h-6 bg-crys-gold/20 rounded-full flex items-center justify-center mr-4 mt-1 group-hover/item:scale-110 transition-transform duration-200">
                      <div className="w-2 h-2 bg-crys-gold rounded-full"></div>
                    </div>
                    <span className="text-gray-300 text-lg">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="group"
          >
            <div className="bg-gradient-to-br from-crys-graphite/40 to-crys-graphite/20 rounded-3xl p-10 backdrop-blur-sm border border-crys-gold/20 hover:border-crys-gold/40 transition-all duration-500 h-full">
              <div className="flex items-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-crys-gold/20 to-crys-gold/10 rounded-2xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform duration-300">
                  <Lightbulb className="w-8 h-8 text-crys-gold" />
                </div>
                <h3 className="text-3xl font-bold text-crys-gold">Our Mission</h3>
              </div>
              
              <p className="text-gray-300 text-xl leading-relaxed mb-8">
                To provide cutting-edge audio mastering technology that combines the precision of traditional studio 
                equipment with the speed and accessibility of modern web applications. We're committed to continuous 
                innovation and user experience excellence.
              </p>
              
              <div className="space-y-4">
                {[
                  "Develop industry-leading Crys Garage Engine mastering algorithms",
                  "Create intuitive, real-time processing workflows",
                  "Support artists at every stage of their journey"
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start group/item"
                  >
                    <div className="w-6 h-6 bg-crys-gold/20 rounded-full flex items-center justify-center mr-4 mt-1 group-hover/item:scale-110 transition-transform duration-200">
                      <div className="w-2 h-2 bg-crys-gold rounded-full"></div>
                    </div>
                    <span className="text-gray-300 text-lg">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Core Values */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h3 className="text-4xl font-bold text-crys-gold mb-4">Our Core Values</h3>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            The principles that guide everything we do at Crysgarage
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { 
              icon: Users, 
              title: "Community First", 
              description: "We believe in building a supportive community of artists and producers who inspire and learn from each other.",
              color: "from-blue-500/20 to-blue-600/10"
            },
            { 
              icon: Globe, 
              title: "Global Impact", 
              description: "Our technology serves artists from diverse backgrounds and cultures, promoting global creative expression.",
              color: "from-green-500/20 to-green-600/10"
            },
            { 
              icon: Lightbulb, 
              title: "Innovation", 
              description: "We continuously push the boundaries of what's possible in audio processing and web technology.",
              color: "from-purple-500/20 to-purple-600/10"
            },
            { 
              icon: Heart, 
              title: "Passion", 
              description: "We're driven by our love for music and the desire to help artists achieve their creative vision.",
              color: "from-red-500/20 to-red-600/10"
            },
            { 
              icon: Shield, 
              title: "Quality", 
              description: "We maintain the highest standards in everything we do, from code quality to user experience.",
              color: "from-yellow-500/20 to-yellow-600/10"
            },
            { 
              icon: Zap, 
              title: "Excellence", 
              description: "We strive for excellence in every interaction, every feature, and every line of code we write.",
              color: "from-orange-500/20 to-orange-600/10"
            }
          ].map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group bg-gradient-to-br from-crys-graphite/30 to-crys-graphite/10 rounded-2xl p-8 backdrop-blur-sm border border-crys-gold/10 hover:border-crys-gold/30 transition-all duration-300"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <value.icon className="w-8 h-8 text-crys-gold" />
              </div>
              <h4 className="text-2xl font-bold text-crys-gold mb-4 text-center">{value.title}</h4>
              <p className="text-gray-300 text-center leading-relaxed">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VisionMission;

import React from 'react';
import { motion } from 'framer-motion';
import { Target, Lightbulb, Users, Globe } from 'lucide-react';

const VisionMission: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-gray-800">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-crys-gold mb-6">
            Our Vision & Mission
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Empowering artists worldwide with professional-grade audio mastering technology
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Vision */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-crys-graphite/30 rounded-2xl p-8 backdrop-blur-sm border border-crys-gold/10"
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-crys-gold/20 rounded-lg flex items-center justify-center mr-4">
                <Target className="w-6 h-6 text-crys-gold" />
              </div>
              <h3 className="text-2xl font-bold text-crys-gold">Our Vision</h3>
            </div>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              To democratize professional audio mastering by making studio-quality processing accessible to every artist, 
              producer, and content creator worldwide. We envision a future where geographical and financial barriers 
              no longer limit creative expression.
            </p>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start">
                <span className="text-crys-gold mr-3">•</span>
                Global accessibility to professional mastering tools
              </li>
              <li className="flex items-start">
                <span className="text-crys-gold mr-3">•</span>
                Real-time collaboration and instant feedback
              </li>
              <li className="flex items-start">
                <span className="text-crys-gold mr-3">•</span>
                Crys Garage Engine-powered optimization for every genre and style
              </li>
            </ul>
          </motion.div>

          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="bg-crys-graphite/30 rounded-2xl p-8 backdrop-blur-sm border border-crys-gold/10"
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-crys-gold/20 rounded-lg flex items-center justify-center mr-4">
                <Lightbulb className="w-6 h-6 text-crys-gold" />
              </div>
              <h3 className="text-2xl font-bold text-crys-gold">Our Mission</h3>
            </div>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              To provide cutting-edge audio mastering technology that combines the precision of traditional studio 
              equipment with the speed and accessibility of modern web applications. We're committed to continuous 
              innovation and user experience excellence.
            </p>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start">
                <span className="text-crys-gold mr-3">•</span>
                Develop industry-leading Crys Garage Engine mastering algorithms
              </li>
              <li className="flex items-start">
                <span className="text-crys-gold mr-3">•</span>
                Create intuitive, real-time processing workflows
              </li>
              <li className="flex items-start">
                <span className="text-crys-gold mr-3">•</span>
                Support artists at every stage of their journey
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <h3 className="text-3xl font-bold text-crys-gold text-center mb-12">Our Core Values</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-crys-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-crys-gold" />
              </div>
              <h4 className="text-xl font-semibold text-crys-gold mb-3">Community First</h4>
              <p className="text-gray-300">
                We believe in building a supportive community of artists and producers who inspire and learn from each other.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-crys-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-crys-gold" />
              </div>
              <h4 className="text-xl font-semibold text-crys-gold mb-3">Global Impact</h4>
              <p className="text-gray-300">
                Our technology serves artists from diverse backgrounds and cultures, promoting global creative expression.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-crys-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-8 h-8 text-crys-gold" />
              </div>
              <h4 className="text-xl font-semibold text-crys-gold mb-3">Innovation</h4>
              <p className="text-gray-300">
                We continuously push the boundaries of what's possible in audio processing and web technology.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default VisionMission;

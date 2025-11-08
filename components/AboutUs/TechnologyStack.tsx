import React from 'react';
import { motion } from 'framer-motion';

const TechnologyStack: React.FC = () => {
  const technologies = [
    { name: "React", category: "Frontend", icon: "⚛️" },
    { name: "TypeScript", category: "Frontend", icon: "📘" },
    { name: "Node.js", category: "Backend", icon: "🟢" },
    { name: "PHP/Laravel", category: "Backend", icon: "🐘" },
    { name: "Ruby", category: "Audio Processing", icon: "💎" },
    { name: "Web Audio API", category: "Audio", icon: "🎵" },
    { name: "Docker", category: "DevOps", icon: "🐳" },
    { name: "AWS", category: "Cloud", icon: "☁️" }
  ];

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
            Technology Stack
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Built with cutting-edge technologies for optimal performance and user experience
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {technologies.map((tech, index) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-crys-graphite/30 rounded-xl p-6 backdrop-blur-sm border border-crys-gold/10 text-center"
            >
              <div className="text-4xl mb-4">{tech.icon}</div>
              <h3 className="text-lg font-semibold text-crys-gold mb-2">{tech.name}</h3>
              <p className="text-gray-400 text-sm">{tech.category}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechnologyStack;

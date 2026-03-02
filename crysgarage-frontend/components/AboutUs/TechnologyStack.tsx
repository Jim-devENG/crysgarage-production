import React from 'react';
import { motion } from 'framer-motion';
import { Code, Database, Cloud, Cpu, Zap, Shield, Globe, Layers } from 'lucide-react';

const TechnologyStack: React.FC = () => {
  const technologies = [
    { 
      name: "React", 
      category: "Frontend", 
      icon: Code, 
      description: "Modern UI framework",
      color: "from-blue-500/20 to-blue-600/10",
      level: 95
    },
    { 
      name: "TypeScript", 
      category: "Frontend", 
      icon: Shield, 
      description: "Type-safe development",
      color: "from-blue-600/20 to-blue-700/10",
      level: 90
    },
    { 
      name: "Node.js", 
      category: "Backend", 
      icon: Cpu, 
      description: "Server-side JavaScript",
      color: "from-green-500/20 to-green-600/10",
      level: 88
    },
    { 
      name: "Python", 
      category: "Audio Processing", 
      icon: Zap, 
      description: "Audio mastering algorithms",
      color: "from-yellow-500/20 to-yellow-600/10",
      level: 92
    },
    { 
      name: "Web Audio API", 
      category: "Audio", 
      icon: Layers, 
      description: "Real-time audio processing",
      color: "from-purple-500/20 to-purple-600/10",
      level: 85
    },
    { 
      name: "Docker", 
      category: "DevOps", 
      icon: Database, 
      description: "Containerized deployment",
      color: "from-cyan-500/20 to-cyan-600/10",
      level: 80
    },
    { 
      name: "AWS", 
      category: "Cloud", 
      icon: Cloud, 
      description: "Scalable cloud infrastructure",
      color: "from-orange-500/20 to-orange-600/10",
      level: 87
    },
    { 
      name: "FastAPI", 
      category: "Backend", 
      icon: Globe, 
      description: "High-performance API",
      color: "from-teal-500/20 to-teal-600/10",
      level: 90
    }
  ];

  const categories = [
    { name: "Frontend", count: 2, color: "from-blue-500/20 to-blue-600/10" },
    { name: "Backend", count: 3, color: "from-green-500/20 to-green-600/10" },
    { name: "Audio Processing", count: 2, color: "from-purple-500/20 to-purple-600/10" },
    { name: "Infrastructure", count: 1, color: "from-orange-500/20 to-orange-600/10" }
  ];

  return (
    <section className="py-24 px-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(30deg, #D4AF37 1px, transparent 1px), linear-gradient(-30deg, #D4AF37 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
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
              <Code className="w-8 h-8 text-black" />
            </div>
          </motion.div>

          <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-crys-gold via-crys-gold-muted to-crys-gold bg-clip-text text-transparent mb-8">
            Technology Stack
          </h2>
          <p className="text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Built with cutting-edge technologies for optimal performance and user experience
          </p>
        </motion.div>

        {/* Category Overview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-3xl font-bold text-crys-gold text-center mb-8">Technology Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className={`w-20 h-20 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <Code className="w-8 h-8 text-crys-gold" />
                </div>
                <h4 className="text-xl font-bold text-crys-gold mb-2">{category.name}</h4>
                <p className="text-gray-400">{category.count} technologies</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Technology Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {technologies.map((tech, index) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group"
            >
              <div className="bg-gradient-to-br from-crys-graphite/40 to-crys-graphite/20 rounded-2xl p-8 backdrop-blur-sm border border-crys-gold/20 hover:border-crys-gold/40 transition-all duration-300 h-full">
                {/* Icon */}
                <div className={`w-16 h-16 bg-gradient-to-br ${tech.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <tech.icon className="w-8 h-8 text-crys-gold" />
                </div>

                {/* Content */}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-crys-gold mb-2">{tech.name}</h3>
                  <p className="text-crys-gold/80 font-medium mb-3">{tech.category}</p>
                  <p className="text-gray-300 text-sm leading-relaxed">{tech.description}</p>
                </div>

                {/* Skill Level */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Proficiency</span>
                    <span className="text-crys-gold text-sm font-medium">{tech.level}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${tech.level}%` }}
                      transition={{ duration: 1, delay: 1 + index * 0.1 }}
                      viewport={{ once: true }}
                      className="h-2 bg-gradient-to-r from-crys-gold to-crys-gold-muted rounded-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tech Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <div className="bg-gradient-to-br from-crys-graphite/30 to-crys-graphite/10 rounded-3xl p-12 backdrop-blur-sm border border-crys-gold/20">
            <h3 className="text-3xl font-bold text-crys-gold text-center mb-12">Our Tech Impact</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: "Technologies Used", value: "25+" },
                { label: "Performance Score", value: "98%" },
                { label: "Uptime", value: "99.9%" },
                { label: "Response Time", value: "<100ms" }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.4 + index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="text-4xl font-bold text-crys-gold mb-2">{stat.value}</div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TechnologyStack;

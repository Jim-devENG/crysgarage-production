import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Star, 
  Zap, 
  Crown, 
  Brain, 
  Settings, 
  Cpu,
  Music,
  Headphones,
  Volume2,
  Mic,
  PlayCircle,
  CheckCircle,
  ArrowRight,
  Users
} from 'lucide-react';

export function StudiosSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const studios = [
    {
      id: "sapphire",
      name: "Sapphire Studio",
      type: "Matchering Studio",
      icon: <Star className="w-8 h-8" />,
      color: "from-blue-500 to-cyan-500",
      description: "Crys Garage Engine mastering using advanced matchering technology",
      detailedDescription: "Sapphire Studio uses our Crys Garage Engine with cutting-edge matchering technology to analyze your reference track and automatically apply professional mastering techniques. Perfect for artists who want professional results without the technical complexity.",
      howItWorks: [
        "Upload your track and a reference song",
        "Crys Garage Engine analyzes the reference track's characteristics",
        "Automatically applies matching mastering techniques",
        "Download your professionally mastered track"
      ],
      bestFor: [
        "New artists learning the craft",
        "Quick professional results",
        "Reference-based mastering",
        "Budget-conscious creators"
      ],
      features: [
        "Crys Garage Engine matchering technology",
        "Reference track analysis",
        "Automatic mastering application",
        "Professional quality output",
        "No technical knowledge required"
      ],
      price: "$5 per download"
    },
    {
      id: "emerald",
      name: "Emerald Studio",
      type: "Crys Garage Engine Studio",
      icon: <Zap className="w-8 h-8" />,
      color: "from-emerald-500 to-green-500",
      description: "Our proprietary Crys Garage Engine for professional mastering",
      detailedDescription: "Emerald Studio features our proprietary Crys Garage Engine, designed specifically for African music. It combines advanced algorithms with genre-specific optimization to deliver professional mastering that understands the nuances of Afrobeats, Gospel, Hip-Hop, and other African music styles.",
      howItWorks: [
        "Upload your track in any format",
        "Crys Garage Engine analyzes your music",
        "Applies genre-specific mastering techniques",
        "Real-time processing and optimization",
        "Download in multiple formats"
      ],
      bestFor: [
        "African music creators",
        "Professional producers",
        "Genre-specific optimization",
        "High-quality mastering needs"
      ],
      features: [
        "Crys Garage Engine technology",
        "Genre-specific optimization",
        "Advanced noise reduction",
        "Real-time processing",
        "Multiple format support",
        "Professional quality standards"
      ],
      price: "$4 per download"
    },
    {
      id: "jasper",
      name: "Jasper Studio",
      type: "Manual Control Studio",
      icon: <Crown className="w-8 h-8" />,
      color: "from-purple-500 to-pink-500",
      description: "Full manual control with professional tools",
      detailedDescription: "Jasper Studio gives you complete creative control with professional-grade tools. Featuring real-time EQ, advanced compression, stereo imaging controls, and A/B comparison tools. Perfect for professional engineers who want to fine-tune every aspect of their mastering process.",
      howItWorks: [
        "Upload your track",
        "Use real-time manual controls",
        "Adjust EQ, compression, and stereo imaging",
        "A/B compare different settings",
        "Live preview and feedback",
        "Download your custom-mastered track"
      ],
      bestFor: [
        "Professional audio engineers",
        "Advanced users",
        "Custom mastering needs",
        "Creative control requirements"
      ],
      features: [
        "8-band graphic EQ",
        "Advanced compression controls",
        "Stereo imaging tools",
        "A/B comparison",
        "Real-time preview",
        "Professional limiter settings",
        "Live feedback system"
      ],
      price: "$25 for 5 credits + 1 bonus"
    }
  ];

  return (
    <section className="bg-gradient-to-br from-crys-black via-crys-charcoal to-crys-black relative py-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-crys-gold/5 via-transparent to-crys-gold/5"></div>
        
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(212, 175, 55, 0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(212, 175, 55, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px'
            }}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Badge variant="secondary" className="bg-crys-gold/20 text-crys-gold mb-4">
            Our Studios
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-crys-white mb-6">
            Choose Your
            <span className="block text-transparent bg-gradient-to-r from-crys-gold via-yellow-400 to-crys-gold bg-clip-text">
              Perfect Studio
            </span>
          </h2>
          <p className="text-xl text-crys-light-grey max-w-3xl mx-auto leading-relaxed">
            Each studio is designed for different needs and skill levels. From Crys Garage Engine automation 
            to full manual control, we have the perfect mastering solution for every creator.
          </p>
        </motion.div>

        {/* Studios Grid */}
        <motion.div 
          className="grid lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {studios.map((studio, index) => (
            <motion.div
              key={studio.id}
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.01 }}
              transition={{ duration: 0.3 }}
              className="group"
            >
              <Card className="bg-audio-panel-bg/80 border-audio-panel-border hover:border-crys-gold/50 transition-all duration-300 h-full backdrop-blur-sm group-hover:shadow-lg group-hover:shadow-crys-gold/10">
                <CardContent className="p-6">
                  {/* Studio Header */}
                  <div className="text-center mb-4">
                    <motion.div 
                      className={`w-12 h-12 bg-gradient-to-br ${studio.color} rounded-xl flex items-center justify-center text-white mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      {studio.icon}
                    </motion.div>
                    
                    <h3 className="text-xl font-bold text-crys-white mb-2 group-hover:text-crys-gold transition-colors duration-300">
                      {studio.name}
                    </h3>
                    
                    <Badge variant="outline" className="border-crys-gold/50 text-crys-gold text-xs mb-2">
                      {studio.type}
                    </Badge>
                    
                    <p className="text-crys-light-grey text-sm mb-3">
                      {studio.description}
                    </p>
                    
                    <div className="text-crys-gold font-bold text-lg">
                      {studio.price}
                    </div>
                  </div>

                  {/* Key Features - Simplified */}
                  <div className="mb-4">
                    <ul className="space-y-1">
                      {studio.features.slice(0, 4).map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-crys-light-grey text-sm">
                          <CheckCircle className="w-3 h-3 text-crys-gold flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}

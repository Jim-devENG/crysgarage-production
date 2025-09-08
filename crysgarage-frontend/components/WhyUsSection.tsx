import { motion } from "framer-motion";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  Award, 
  Users, 
  Globe, 
  Shield, 
  Zap, 
  Star,
  CheckCircle,
  ArrowRight,
  Music,
  Headphones,
  Settings,
  TrendingUp
} from "lucide-react";

interface WhyUsSectionProps {
  onGetStarted?: () => void;
  onTryMastering?: () => void;
}

export function WhyUsSection({ onGetStarted, onTryMastering }: WhyUsSectionProps) {
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

  const reasons = [
    {
      icon: <Award className="w-8 h-8" />,
      title: "African Music Expertise",
      description: "Built specifically for African music styles - Afrobeats, Gospel, Hip-Hop, and more. Our algorithms understand the cultural nuances and sonic characteristics that make African music unique.",
      features: ["Genre-specific optimization", "Cultural understanding", "Local music patterns", "Traditional rhythm recognition"]
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast Processing",
      description: "Professional mastering in under 2 minutes. No more waiting days or weeks for studio availability. Get your tracks ready for release instantly.",
      features: ["2-minute processing", "Real-time preview", "Instant downloads", "No waiting queues"]
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Industry Standard Quality",
      description: "Professional loudness levels (-14 LUFS) perfect for Spotify, Apple Music, YouTube, and radio broadcast. Meet all streaming platform requirements.",
      features: ["-14 LUFS compliance", "Multi-platform optimization", "Broadcast-ready output", "Professional standards"]
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community-Driven",
      description: "Built by African artists, for African artists. Our platform grows with feedback from the community, ensuring we meet real needs of African creators.",
      features: ["Community feedback", "Local artist input", "Continuous improvement", "Cultural relevance"]
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global Reach, Local Heart",
      description: "While optimized for African music, our platform serves creators worldwide. Export in multiple formats for global distribution.",
      features: ["Global distribution", "Multiple formats", "International standards", "Local optimization"]
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Affordable Excellence",
      description: "Professional studio-quality mastering at a fraction of the cost. No expensive studio bookings or equipment investments required.",
      features: ["Cost-effective", "No equipment needed", "Professional results", "Accessible pricing"]
    }
  ];

  const stats = [
    { number: "2", label: "Minutes Processing", suffix: "" },
    { number: "99", label: "Artist Satisfaction", suffix: "%" },
    { number: "50", label: "Countries Served", suffix: "+" },
    { number: "15", label: "Years Combined Experience", suffix: "" }
  ];

  return (
    <section className="bg-gradient-to-br from-crys-black via-crys-charcoal to-crys-black relative py-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        {/* Gradient Overlay */}
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
        
        {/* Floating Elements */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`float-${i}`}
            className="absolute w-2 h-2 bg-crys-gold/30 rounded-full"
            style={{
              top: `${20 + i * 15}%`,
              left: `${10 + i * 15}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-8 sm:px-8 lg:px-12 relative z-10 max-w-[1100px]">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Badge variant="secondary" className="bg-crys-gold/20 text-crys-gold mb-4">
            Why Choose Crys Garage
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-crys-white mb-6">
            The African Music
            <span className="block text-transparent bg-gradient-to-r from-crys-gold via-yellow-400 to-crys-gold bg-clip-text">
              Mastering Revolution
            </span>
          </h2>
          <p className="text-xl text-crys-light-grey max-w-3xl mx-auto leading-relaxed">
            We're not just another mastering platform. We're the first and only platform built specifically 
            for African music creators, by African music creators.
          </p>
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-gradient-to-br from-crys-gold/10 to-crys-gold/5 rounded-xl p-6 border border-crys-gold/20 backdrop-blur-sm">
                <motion.div 
                  className="text-3xl md:text-4xl font-bold text-crys-gold mb-2"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 + index * 0.1 }}
                  viewport={{ once: true }}
                >
                  {stat.number}{stat.suffix}
                </motion.div>
                <div className="text-crys-light-grey text-sm font-medium">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Reasons Grid */}
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {reasons.map((reason, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-audio-panel-bg/80 border-audio-panel-border hover:border-crys-gold/50 transition-all duration-300 h-full backdrop-blur-sm group">
                <CardContent className="p-6">
                  {/* Icon */}
                  <motion.div 
                    className="w-12 h-12 bg-gradient-to-br from-crys-gold/20 to-crys-gold/10 rounded-xl flex items-center justify-center text-crys-gold mb-4 group-hover:scale-110 transition-transform duration-300"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    {reason.icon}
                  </motion.div>
                  
                  {/* Title */}
                  <h3 className="text-crys-white font-semibold text-lg mb-3 group-hover:text-crys-gold transition-colors duration-300">
                    {reason.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-crys-light-grey mb-4 leading-relaxed">
                    {reason.description}
                  </p>
                  
                  {/* Features List */}
                  <ul className="space-y-2">
                    {reason.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-crys-light-grey text-sm">
                        <CheckCircle className="w-4 h-4 text-crys-gold flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        
      </div>
    </section>
  );
}

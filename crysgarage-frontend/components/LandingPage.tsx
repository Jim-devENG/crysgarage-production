import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion } from "framer-motion";
import { 
  Music, 
  Zap, 
  Download, 
  Clock, 
  Headphones,
  Star,
  Users,
  TrendingUp,
  Mic,
  PlayCircle,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Volume2,
  Music2,
  Radio,
  Waves,
  Cpu,
  Disc3
} from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
  onTryMastering: () => void;
}

export function LandingPage({ onGetStarted, onTryMastering }: LandingPageProps) {
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

  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Intelligent Mastering",
      description: "Our proprietary Crys Garage Engine analyzes and optimizes your audio with professional precision in minutes, not hours.",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop"
    },
    {
      icon: <Music className="w-8 h-8" />,
      title: "African Music Focused",
      description: "Specialized optimization for Afrobeats, Gospel, Hip-Hop, and other African music styles with cultural understanding.",
      image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=300&fit=crop"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Professional mastering in under 2 minutes. No more waiting days or weeks for studio availability.",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop"
    },
    {
      icon: <Download className="w-8 h-8" />,
      title: "Multiple Formats",
      description: "Export in WAV, MP3, FLAC with up to 192kHz/24-bit quality, optimized for all streaming platforms.",
      image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=300&fit=crop"
    },
    {
      icon: <Volume2 className="w-8 h-8" />,
      title: "Real-Time Controls",
      description: "Advanced tier includes live EQ, compression, and limiting controls with instant preview capabilities.",
      image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=300&fit=crop"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Industry Standard",
      description: "Professional loudness levels (-14 LUFS) perfect for Spotify, Apple Music, YouTube, and radio broadcast.",
      image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=300&fit=crop"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Tracks Mastered" },
    { number: "2,500+", label: "Happy Artists" },
    { number: "< 2min", label: "Average Processing" },
    { number: "99.9%", label: "Satisfaction Rate" }
  ];

  const testimonials = [
    {
      name: "Kwame Asante",
      role: "Afrobeats Producer",
      content: "Crysgarage transformed my workflow. What used to take days now takes minutes, and the quality is incredible.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
    },
    {
      name: "Grace Okafor",
      role: "Gospel Artist",
      content: "The genre-specific optimization for Gospel music is amazing. My vocals have never sounded this professional.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108755-2616b2e00f02?w=400&h=400&fit=crop&crop=face"
    },
    {
      name: "DJ Kojo",
      role: "Hip-Hop Producer",
      content: "The real-time controls in Advanced tier give me complete creative control. It's like having a mastering engineer in my browser.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Audio Wave Pattern */}
      <section className="relative overflow-hidden py-20 md:py-32 min-h-screen flex items-center">
        {/* Audio Waveform Pattern Background */}
        <div className="absolute inset-0 z-0">
          {/* Primary Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-crys-black via-crys-charcoal to-crys-black"></div>
          
          {/* Animated Waveform Pattern */}
          <div className="absolute inset-0 opacity-30">
            {/* Large Waveforms */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`wave-large-${i}`}
                className="absolute h-1 bg-gradient-to-r from-transparent via-crys-gold to-transparent"
                style={{
                  width: `${60 + i * 10}%`,
                  top: `${15 + i * 10}%`,
                  left: `${-20 + i * 5}%`,
                }}
                animate={{
                  x: ['-100%', '100%'],
                  opacity: [0, 0.6, 0],
                }}
                transition={{
                  duration: 4 + i * 0.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeInOut"
                }}
              />
            ))}
            
            {/* Medium Waveforms */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={`wave-medium-${i}`}
                className="absolute h-px bg-gradient-to-r from-transparent via-crys-gold/60 to-transparent"
                style={{
                  width: `${30 + i * 8}%`,
                  top: `${5 + i * 7}%`,
                  right: `${-10 + i * 3}%`,
                }}
                animate={{
                  x: ['100%', '-100%'],
                  opacity: [0, 0.4, 0],
                }}
                transition={{
                  duration: 3 + i * 0.3,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "linear"
                }}
              />
            ))}
          </div>
          
          {/* Audio Spectrum Analyzer Pattern */}
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-20">
            <div className="flex items-end justify-center h-full gap-1 px-8">
              {[...Array(32)].map((_, i) => (
                <motion.div
                  key={`bar-${i}`}
                  className="bg-gradient-to-t from-crys-gold/80 to-crys-gold/20 w-2"
                  animate={{
                    height: [`${Math.random() * 20 + 10}%`, `${Math.random() * 80 + 20}%`, `${Math.random() * 20 + 10}%`],
                  }}
                  transition={{
                    duration: 1.5 + Math.random() * 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          </div>
          
          {/* Circular Audio Ripples */}
          <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={`ripple-${i}`}
                className="absolute border border-crys-gold/20 rounded-full"
                style={{
                  width: `${(i + 1) * 150}px`,
                  height: `${(i + 1) * 150}px`,
                  top: `${-(i + 1) * 75}px`,
                  left: `${-(i + 1) * 75}px`,
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.6, 0.1, 0.6],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
          
          {/* Digital Grid Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div 
              className="w-full h-full"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(212, 175, 55, 0.1) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(212, 175, 55, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px'
              }}
            />
          </div>
          
          {/* Floating Audio Particles */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={`particle-${i}`}
                className="absolute w-2 h-2 bg-crys-gold/40 rounded-full"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -100, 0],
                  x: [0, Math.random() * 50 - 25, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 8 + Math.random() * 4,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
          
          {/* Sound Wave Frequency Lines */}
          <div className="absolute bottom-0 left-0 w-full h-32 opacity-25">
            {[...Array(200)].map((_, i) => (
              <motion.div
                key={`freq-${i}`}
                className="absolute bottom-0 bg-gradient-to-t from-crys-gold to-transparent"
                style={{
                  left: `${(i / 200) * 100}%`,
                  width: '2px',
                }}
                animate={{
                  height: [`${Math.random() * 20 + 5}%`, `${Math.random() * 60 + 10}%`, `${Math.random() * 20 + 5}%`],
                }}
                transition={{
                  duration: 2 + Math.random() * 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            {/* Left Content */}
            <motion.div 
              className="max-w-2xl"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Badge */}
              <motion.div 
                className="inline-flex items-center gap-2 bg-crys-gold/10 border border-crys-gold/30 rounded-full px-6 py-3 mb-8 backdrop-blur-sm"
                variants={itemVariants}
              >
                <Sparkles className="w-5 h-5 text-crys-gold" />
                <span className="text-crys-gold">Powered by Crys Garage Engine</span>
              </motion.div>
              
              {/* Main Headline */}
              <motion.h1 
                className="text-5xl md:text-6xl lg:text-7xl font-bold text-crys-white mb-6 leading-tight"
                variants={itemVariants}
              >
                Craft the Sound,
                <span className="block text-transparent bg-gradient-to-r from-crys-gold to-crys-gold-muted bg-clip-text text-[64px]">
                  Unleash the Future
                </span>
              </motion.h1>
              
              {/* Subheadline */}
              <motion.p 
                className="text-xl md:text-2xl text-crys-light-grey mb-4 max-w-2xl leading-relaxed"
                variants={itemVariants}
              >
                Professional audio mastering platform designed for African artists and producers. 
                Get studio-quality masters in minutes, not days.
              </motion.p>
              
              {/* Problem Statement */}
              <motion.div 
                className="bg-crys-graphite/30 rounded-2xl p-6 mb-12 max-w-xl backdrop-blur-sm border border-crys-gold/10"
                variants={itemVariants}
              >
                <div className="grid md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <h4 className="text-red-400 font-medium mb-2">Traditional Mastering</h4>
                    <ul className="space-y-1 text-crys-light-grey">
                      <li>• $50-200+ per track</li>
                      <li>• Days to weeks turnaround</li>
                      <li>• Studio booking required</li>
                      <li>• Limited accessibility</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-crys-gold font-medium mb-2">Crysgarage Studio</h4>
                    <ul className="space-y-1 text-crys-light-grey">
                      <li>• $5-20 per session</li>
                      <li>• Under 2 minutes</li>
                      <li>• 24/7 availability</li>
                      <li>• Accessible to everyone</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
              
              {/* CTA Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 mb-12"
                variants={itemVariants}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    size="lg"
                    onClick={onTryMastering}
                    className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black px-8 py-4 text-lg"
                  >
                    <PlayCircle className="w-5 h-5 mr-2" />
                    Try Our Mastering App
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={onGetStarted}
                    className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10 px-8 py-4 text-lg backdrop-blur-sm"
                  >
                    <Mic className="w-5 h-5 mr-2" />
                    View Pricing
                  </Button>
                </motion.div>
              </motion.div>
              
              {/* Quick Stats */}
              <motion.div 
                className="grid grid-cols-2 md:grid-cols-4 gap-6"
                variants={containerVariants}
              >
                {stats.map((stat, index) => (
                  <motion.div 
                    key={index} 
                    className="text-center bg-crys-graphite/20 rounded-lg p-4 backdrop-blur-sm border border-crys-gold/10"
                    variants={itemVariants}
                    whileHover={{ scale: 1.1 }}
                  >
                    <div className="text-2xl md:text-3xl font-bold text-crys-gold mb-1">{stat.number}</div>
                    <div className="text-crys-light-grey text-sm">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Visual Content - Audio Visualization */}
            <motion.div 
              className="relative"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-crys-gold/20 rounded-2xl blur-xl"></div>
                <div className="relative z-10 bg-gradient-to-br from-crys-gold/10 to-crys-gold/5 rounded-2xl border border-crys-gold/30 overflow-hidden backdrop-blur-sm p-8">
                  {/* Audio Visualization Display */}
                  <div className="aspect-[4/3] relative flex flex-col items-center justify-center">
                    {/* Central Visualization */}
                    <div className="relative w-full h-48 mb-6">
                      {/* Equalizer Bars */}
                      <div className="flex items-end justify-center h-full gap-2">
                        {[...Array(16)].map((_, i) => (
                          <motion.div
                            key={`eq-bar-${i}`}
                            className="bg-gradient-to-t from-crys-gold to-crys-gold/30 w-4 rounded-t"
                            animate={{
                              height: [`${30 + Math.random() * 20}%`, `${50 + Math.random() * 50}%`, `${30 + Math.random() * 20}%`],
                            }}
                            transition={{
                              duration: 1 + Math.random() * 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                        ))}
                      </div>
                      
                      {/* Circular Frequency Display */}
                      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                        <div className="relative">
                          {[...Array(3)].map((_, i) => (
                            <motion.div
                              key={`circle-${i}`}
                              className="absolute border border-crys-gold/40 rounded-full"
                              style={{
                                width: `${(i + 1) * 80}px`,
                                height: `${(i + 1) * 80}px`,
                                top: `${-(i + 1) * 40}px`,
                                left: `${-(i + 1) * 40}px`,
                              }}
                              animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.4, 0.8, 0.4],
                              }}
                              transition={{
                                duration: 2 + i * 0.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            />
                          ))}
                          <div className="w-6 h-6 bg-crys-gold rounded-full flex items-center justify-center">
                            <Volume2 className="w-3 h-3 text-crys-black" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <h3 className="text-crys-white text-xl font-semibold mb-2">
                        Professional Audio Mastering
                      </h3>
                      <p className="text-crys-light-grey text-sm leading-relaxed">
                        Real-time audio analysis and processing visualization
                      </p>
                      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-crys-gold">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-crys-gold rounded-full pulse-gold"></div>
                          <span>Processing</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Waves className="w-3 h-3" />
                          <span>44.1kHz/24-bit</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-crys-charcoal/50 relative">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1571974599782-87624638275b?w=1920&h=1080&fit=crop"
            alt="Audio mixing console"
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-crys-charcoal/80"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Badge variant="secondary" className="bg-crys-gold/20 text-crys-gold mb-4">
              Platform Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-crys-white mb-6">
              Everything You Need for Professional Mastering
            </h2>
            <p className="text-xl text-crys-light-grey max-w-3xl mx-auto">
              From intelligent processing to manual controls, we've built every tool you need to create professional masters
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
              >
                <Card className="bg-audio-panel-bg/80 border-audio-panel-border hover:border-crys-gold/50 transition-all duration-300 group h-full overflow-hidden backdrop-blur-sm">
                  <div className="aspect-[16/9] relative overflow-hidden">
                    <ImageWithFallback
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-crys-black/80 via-crys-black/40 to-transparent"></div>
                    <motion.div 
                      className="absolute top-4 right-4 w-12 h-12 bg-crys-gold/20 rounded-lg flex items-center justify-center text-crys-gold group-hover:bg-crys-gold/30 transition-colors backdrop-blur-sm"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      {feature.icon}
                    </motion.div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-crys-white text-xl font-semibold mb-4">{feature.title}</h3>
                    <p className="text-crys-light-grey leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 relative">
        {/* Background with Audio Visualizations */}
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1574692289538-f0a1d9e93c40?w=1920&h=1080&fit=crop"
            alt="Digital audio interface"
            className="w-full h-full object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-crys-black/90 via-crys-black/85 to-crys-black/90"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Badge variant="secondary" className="bg-crys-gold/20 text-crys-gold mb-4">
              Simple Process
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-crys-white mb-6">
              Professional Masters in 3 Steps
            </h2>
            <p className="text-xl text-crys-light-grey max-w-3xl mx-auto">
              Our streamlined workflow gets you professional results without the complexity
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Upload Your Track",
                  description: "Drag and drop your audio file. We support WAV, MP3, FLAC, and more. Files up to 100MB.",
                  icon: <Music2 className="w-8 h-8" />,
                  image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"
                },
                {
                  step: "02",
                  title: "Crys Garage Analysis & Processing",
                  description: "Our Crys Garage Engine analyzes your track and applies genre-specific optimization techniques.",
                  icon: <Cpu className="w-8 h-8" />,
                  image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop"
                },
                {
                  step: "03",
                  title: "Download & Share",
                  description: "Get your professional master in minutes. Download in multiple formats ready for streaming.",
                  icon: <Download className="w-8 h-8" />,
                  image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=300&fit=crop"
                }
              ].map((step, index) => (
                <motion.div 
                  key={index} 
                  className="relative"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  {/* Connection Line */}
                  {index < 2 && (
                    <motion.div 
                      className="hidden md:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-crys-gold/50 to-transparent z-0"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      transition={{ duration: 1, delay: (index + 1) * 0.5 }}
                      viewport={{ once: true }}
                    />
                  )}
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="bg-audio-panel-bg/80 border-audio-panel-border relative z-10 hover:border-crys-gold/50 transition-all duration-300 overflow-hidden backdrop-blur-sm">
                      <div className="relative h-40 overflow-hidden">
                        <ImageWithFallback
                          src={step.image}
                          alt={step.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-crys-black/80 via-crys-black/40 to-transparent"></div>
                        <motion.div 
                          className="absolute top-4 right-4 w-12 h-12 bg-crys-gold/20 rounded-lg flex items-center justify-center text-crys-gold backdrop-blur-sm"
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          {step.icon}
                        </motion.div>
                        <div className="absolute bottom-4 right-4 w-10 h-10 bg-crys-gold/90 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <span className="text-crys-black text-sm font-bold">{step.step}</span>
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <h3 className="text-crys-white text-xl font-semibold mb-3">{step.title}</h3>
                        <p className="text-crys-light-grey">{step.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-crys-charcoal/30 relative">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1920&h=1080&fit=crop"
            alt="Music production workspace"
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-crys-charcoal/80"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Badge variant="secondary" className="bg-crys-gold/20 text-crys-gold mb-4">
              Artist Stories
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-crys-white mb-6">
              Trusted by African Artists
            </h2>
            <p className="text-xl text-crys-light-grey max-w-3xl mx-auto">
              Join thousands of producers and artists who've transformed their sound with Crysgarage
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
              >
                <Card className="bg-audio-panel-bg/80 border-audio-panel-border backdrop-blur-sm">
                  <CardContent className="p-8">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <Star className="w-5 h-5 text-crys-gold fill-current" />
                        </motion.div>
                      ))}
                    </div>
                    <p className="text-crys-light-grey mb-6 italic leading-relaxed">"{testimonial.content}"</p>
                    <div className="flex items-center gap-3">
                      <ImageWithFallback
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-crys-gold/30"
                      />
                      <div>
                        <div className="text-crys-white font-medium">{testimonial.name}</div>
                        <div className="text-crys-light-grey text-sm">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* African Music Focus Section */}
      <section className="py-20 relative">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1920&h=1080&fit=crop"
            alt="African music instruments"
            className="w-full h-full object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-crys-black/90 via-crys-black/85 to-crys-black/90"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div 
              className="order-1 md:order-1"
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Badge variant="secondary" className="bg-crys-gold/20 text-crys-gold mb-4">
                African Music Excellence
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-crys-white mb-6">
                Built for African Creators, By African Creators
              </h2>
              <p className="text-xl text-crys-light-grey mb-6 leading-relaxed">
                Our processing algorithms understand the unique characteristics of African music genres, 
                from the rhythmic complexity of Afrobeats to the spiritual depth of Gospel.
              </p>
              <motion.div 
                className="grid grid-cols-2 gap-6 mb-8"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {[
                  { genre: "Afrobeats", tracks: "3,200+" },
                  { genre: "Gospel", tracks: "2,800+" },
                  { genre: "Hip-Hop", tracks: "2,100+" },
                  { genre: "Amapiano", tracks: "1,500+" }
                ].map((item, index) => (
                  <motion.div 
                    key={index} 
                    className="text-center p-4 bg-crys-graphite/30 rounded-lg backdrop-blur-sm"
                    variants={itemVariants}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-2xl font-bold text-crys-gold">{item.tracks}</div>
                    <div className="text-crys-light-grey text-sm">{item.genre} Masters</div>
                  </motion.div>
                ))}
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={onTryMastering}
                  className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black"
                >
                  Explore African Genres
                </Button>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="order-2 md:order-2"
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-crys-gold/20 rounded-2xl blur-xl"></div>
                <div className="relative z-10 bg-gradient-to-br from-crys-gold/10 to-crys-gold/5 rounded-2xl border border-crys-gold/30 overflow-hidden backdrop-blur-sm">
                  <div className="aspect-[4/3] relative">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&h=450&fit=crop"
                      alt="African musician with headphones"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-crys-black/60 via-transparent to-transparent"></div>
                    <div className="absolute bottom-6 left-6 right-6 text-center">
                      <motion.div
                        className="w-16 h-16 bg-crys-gold/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Music className="w-8 h-8 text-crys-gold" />
                      </motion.div>
                      <h3 className="text-crys-white text-xl font-semibold mb-2">
                        Genre-Specific Mastering
                      </h3>
                      <p className="text-crys-light-grey text-sm leading-relaxed">
                        Experience professional mastering tailored to your specific genre. 
                        Each style receives custom treatment to enhance its unique characteristics.
                      </p>
                      <div className="mt-4 flex items-center justify-center gap-2">
                        <div className="flex -space-x-2">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="w-6 h-6 bg-crys-gold/30 rounded-full border-2 border-crys-gold/50 backdrop-blur-sm"></div>
                          ))}
                        </div>
                        <span className="text-crys-light-grey text-xs ml-2">Join 2,500+ Artists</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Perfect For Section */}
      <section className="py-20 bg-crys-charcoal/50 relative">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1571974599782-87624638275b?w=1920&h=1080&fit=crop"
            alt="Professional audio setup"
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-crys-charcoal/80"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Badge variant="secondary" className="bg-crys-gold/20 text-crys-gold mb-4">
              Who We Serve
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-crys-white mb-6">
              Perfect For Every Creator
            </h2>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                title: "Independent Artists",
                icon: <Mic className="w-8 h-8" />,
                benefits: ["Affordable professional mastering", "Quick turnaround", "Multiple format options", "No studio booking"],
                image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=200&fit=crop"
              },
              {
                title: "Music Producers",
                icon: <Music className="w-8 h-8" />,
                benefits: ["Real-time preview", "Professional tools", "Genre optimization", "Client-ready output"],
                image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=200&fit=crop"
              },
              {
                title: "Content Creators",
                icon: <Radio className="w-8 h-8" />,
                benefits: ["Podcast mastering", "Video audio enhancement", "Social media optimization", "Quick processing"],
                image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&h=200&fit=crop"
              },
              {
                title: "API & Distribution",
                icon: <Cpu className="w-8 h-8" />,
                benefits: ["RESTful API integration", "White-label solutions", "Bulk processing endpoints", "Developer-friendly SDKs"],
                image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=200&fit=crop"
              }
            ].map((user, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
              >
                <Card className="bg-audio-panel-bg/80 border-audio-panel-border hover:border-crys-gold/50 transition-all duration-300 overflow-hidden h-full backdrop-blur-sm">
                  <div className="aspect-[2/1] relative overflow-hidden">
                    <ImageWithFallback
                      src={user.image}
                      alt={user.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-crys-black/80 via-crys-black/40 to-transparent"></div>
                    <motion.div 
                      className="absolute top-4 right-4 w-10 h-10 bg-crys-gold/20 rounded-lg flex items-center justify-center text-crys-gold backdrop-blur-sm"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      {user.icon}
                    </motion.div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-crys-white font-semibold mb-4">{user.title}</h3>
                    <ul className="space-y-2">
                      {user.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start gap-2 text-crys-light-grey text-sm">
                          <CheckCircle className="w-4 h-4 text-crys-gold flex-shrink-0 mt-0.5" />
                          <span>{benefit}</span>
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

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-crys-gold/10 via-crys-gold/5 to-crys-gold/10 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=1080&fit=crop"
            alt="Audio waveform"
            className="w-full h-full object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-crys-gold/20 via-crys-gold/10 to-crys-gold/20"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div 
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.h2 
              className="text-4xl md:text-5xl font-bold text-crys-white mb-6"
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Ready to Transform Your Sound?
            </motion.h2>
            <motion.p 
              className="text-xl text-crys-light-grey mb-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Join thousands of artists who've revolutionized their workflow with professional Crysgarage mastering.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg"
                  onClick={onTryMastering}
                  className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black px-8 py-4 text-lg"
                >
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Start Mastering Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={onGetStarted}
                  className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10 px-8 py-4 text-lg backdrop-blur-sm"
                >
                  View All Plans
                </Button>
              </motion.div>
            </motion.div>

            <motion.div 
              className="mt-8 text-crys-light-grey text-sm"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              viewport={{ once: true }}
            >
              Free tier available • No credit card required • Professional results in minutes
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
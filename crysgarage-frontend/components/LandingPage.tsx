import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from './figma/ImageWithFallback';
import { CrysGarageLogo } from './CrysGarageLogo';
import { motion } from "framer-motion";
import { WhyUsSection } from './WhyUsSection';
import { 
  Music, 
  Zap, 
  Download, 
  Clock, 
  Star,
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
  Cpu
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
              title: "Crys Garage Engine Mastering",
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



  const testimonials = [
    {
      name: "Kwame Asante",
      role: "Afrobeats Producer",
      content: "Crys Garage transformed my workflow. What used to take days now takes minutes, and the quality is incredible.",
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
              <section className="relative overflow-hidden min-h-screen flex items-center bg-gradient-to-br from-crys-black via-crys-graphite to-crys-black" style={{ marginTop: '-80px', paddingTop: '80px' }}>
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

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            {/* Left Content */}
            <motion.div 
              className="max-w-2xl relative"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Musical Sparkle Effects */}
              <motion.div
                className="absolute -top-4 -right-4 text-2xl text-crys-gold musical-sparkle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2, delay: 1 }}
              >
                🎵
              </motion.div>
              <motion.div
                className="absolute -bottom-4 -left-4 text-xl text-crys-gold musical-sparkle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2, delay: 1.5 }}
              >
                🎚️
              </motion.div>
              <motion.div
                className="absolute top-1/2 -right-8 text-lg text-crys-gold musical-sparkle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2, delay: 2 }}
              >
                🎧
              </motion.div>
              {/* Main Headline */}
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-crys-white mb-6 leading-tight"
                variants={itemVariants}
              >
                <motion.span 
                  className="block font-musical musical-glow text-4xl md:text-5xl lg:text-6xl"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.2 }}
                >
                  Craft the Sound,
                </motion.span>
                <motion.span 
                  className="block font-audiowide text-transparent bg-gradient-to-r from-crys-gold via-yellow-400 to-crys-gold-muted bg-clip-text text-3xl md:text-4xl lg:text-5xl musical-pulse whitespace-nowrap mt-4"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.4 }}
                >
                  Unleash the Realm
                </motion.span>
              </motion.h1>
              
              {/* Subheadline */}
              <motion.p 
                className="text-xl md:text-2xl text-crys-light-grey mb-4 max-w-2xl leading-relaxed"
                variants={itemVariants}
              >
                Professional audio mastering platform designed for African by African. 
                Get studio-quality masters in minutes, not hours.
              </motion.p>
              
              {/* Problem Statement */}

              
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
                    View Studio
                  </Button>
                </motion.div>
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









      {/* Mastering Requirements Section */}
      <section className="bg-crys-charcoal/30 relative py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Badge variant="secondary" className="bg-crys-gold/20 text-crys-gold mb-6 px-4 py-2 text-sm">
              <Volume2 className="w-4 h-4 mr-2" />
              Mastering Requirements
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-crys-white mb-6">
              Prepare Your Audio for
              <span className="block text-crys-gold bg-gradient-to-r from-crys-gold to-yellow-400 bg-clip-text text-transparent">
                Professional Mastering
              </span>
            </h2>
            <p className="text-xl text-crys-light-grey max-w-3xl mx-auto">
              Follow these guidelines to ensure your tracks get the best possible mastering results
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Headroom Requirements */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="bg-audio-panel-bg border border-crys-graphite hover:border-crys-gold/50 transition-all duration-300 hover:scale-105 group h-full">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-crys-gold/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-crys-gold/30 transition-colors">
                    <Waves className="w-8 h-8 text-crys-gold" />
                  </div>
                  <h3 className="text-xl font-bold text-crys-white mb-3">Headroom Requirements</h3>
                  <div className="space-y-3 text-crys-light-grey">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Minimum:</span>
                      <Badge variant="outline" className="border-red-500/30 text-red-400">-8 dB</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Maximum:</span>
                      <Badge variant="outline" className="border-yellow-500/30 text-yellow-400">-4 dB</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Best Result:</span>
                      <Badge variant="outline" className="border-crys-gold text-crys-gold">-6 dB</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-crys-light-grey mt-4">
                    Ensure your mix has adequate headroom for optimal mastering results
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Normalization */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="bg-audio-panel-bg border border-crys-graphite hover:border-crys-gold/50 transition-all duration-300 hover:scale-105 group h-full">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-crys-gold/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-crys-gold/30 transition-colors">
                    <Cpu className="w-8 h-8 text-crys-gold" />
                  </div>
                  <h3 className="text-xl font-bold text-crys-white mb-3">Audio Normalization</h3>
                  <div className="space-y-3 text-crys-light-grey">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <CheckCircle className="w-5 h-5 text-crys-gold" />
                      <span className="text-sm">Normalize your audio</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <CheckCircle className="w-5 h-5 text-crys-gold" />
                      <span className="text-sm">Avoid clipping</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5 text-crys-gold" />
                      <span className="text-sm">Maintain dynamics</span>
                    </div>
                  </div>
                  <p className="text-xs text-crys-light-grey mt-4">
                    Proper normalization ensures consistent levels and prevents distortion
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Format Requirements */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Card className="bg-audio-panel-bg border border-crys-graphite hover:border-crys-gold/50 transition-all duration-300 hover:scale-105 group h-full">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-crys-gold/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-crys-gold/30 transition-colors">
                    <Music2 className="w-8 h-8 text-crys-gold" />
                  </div>
                  <h3 className="text-xl font-bold text-crys-white mb-3">Format Requirements</h3>
                  <div className="space-y-3 text-crys-light-grey">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <CheckCircle className="w-5 h-5 text-crys-gold" />
                      <span className="text-sm">WAV or MP3 format</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <CheckCircle className="w-5 h-5 text-crys-gold" />
                      <span className="text-sm">44.1kHz or higher</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5 text-crys-gold" />
                      <span className="text-sm">16-bit or higher</span>
                    </div>
                  </div>
                  <p className="text-xs text-crys-light-grey mt-4">
                    High-quality source files ensure the best mastering results
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Important Notice */}
          <motion.div 
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="bg-gradient-to-r from-crys-gold/10 to-crys-gold/5 border border-crys-gold/20 rounded-2xl p-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Radio className="w-6 h-6 text-crys-gold" />
                <h3 className="text-lg font-semibold text-crys-white">Pro Tip</h3>
              </div>
              <p className="text-crys-light-grey">
                <span className="text-crys-gold font-semibold">-6 dB headroom</span> is the sweet spot for mastering. 
                This gives our Crys Garage Engine enough room to work with while maintaining your mix's dynamics and character.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Us Section */}
      <WhyUsSection 
        onGetStarted={onGetStarted}
        onTryMastering={onTryMastering}
      />

      {/* Perfect For Section */}
      <section className="bg-crys-charcoal/50 relative pt-16 pb-16">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1571974599782-87624638275b?w=1920&h=1080&fit=crop"
            alt="Professional audio setup"
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-crys-charcoal/80"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
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
      <section className="bg-gradient-to-r from-crys-gold/10 via-crys-gold/5 to-crys-gold/10 relative overflow-hidden pt-16 pb-16">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src="/studio.jpg"
            alt="Studio background"
            className="w-full h-full object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-crys-gold/20 via-crys-gold/10 to-crys-gold/20"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <motion.div 
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.h2 
              className="text-4xl md:text-6xl font-bold text-crys-white mb-6 leading-tight"
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <span className="bg-gradient-to-r from-crys-gold via-yellow-400 to-crys-gold bg-clip-text text-transparent animate-pulse">
                Craft the Sound,
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-crys-gold bg-clip-text text-transparent">
                Unleash the Future
              </span>
            </motion.h2>
            <motion.p 
              className="text-xl md:text-2xl text-crys-light-grey mb-8 font-medium italic"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <span className="text-crys-gold">♪</span> Can you make it? 
              <span className="text-crys-gold">♫</span> Craft the sound, 
              <span className="text-crys-gold">♪</span> Unleash the realm 
              <span className="text-crys-gold">♫</span>
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
                  Try Mastering Now
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
                  Get Started
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
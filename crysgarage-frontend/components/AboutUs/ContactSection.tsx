import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, MessageCircle, Users, Zap, Star } from 'lucide-react';

interface ContactSectionProps {
  onNavigate?: (section: string) => void;
}

const ContactSection: React.FC<ContactSectionProps> = ({ onNavigate }) => {
  const contactMethods = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get direct help from our team",
      action: "info@crysgarage.studio",
      href: "mailto:info@crysgarage.studio",
      color: "from-blue-500/20 to-blue-600/10"
    },
    {
      icon: MessageCircle,
      title: "Community Chat",
      description: "Join our WhatsApp community",
      action: "Join Community",
      href: "https://chat.whatsapp.com/L1eDQaPVv5L2KZE0754QD3",
      color: "from-green-500/20 to-green-600/10"
    },
    {
      icon: Users,
      title: "Partnership",
      description: "Collaborate with us",
      action: "Let's Partner",
      href: "mailto:partnerships@crysgarage.studio",
      color: "from-purple-500/20 to-purple-600/10"
    }
  ];

  const features = [
    { icon: Zap, text: "Real-time processing" },
    { icon: Star, text: "Studio-quality results" },
    { icon: Users, text: "Global community" }
  ];

  return (
    <section className="py-24 px-4 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`bg-circle-${i}`}
            className="absolute w-2 h-2 bg-crys-gold rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
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
              <MessageCircle className="w-8 h-8 text-black" />
            </div>
          </motion.div>

          <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-crys-gold via-crys-gold-muted to-crys-gold bg-clip-text text-transparent mb-8">
            Get in Touch
          </h2>
          <p className="text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Have questions about our technology or want to collaborate? We'd love to hear from you.
          </p>
        </motion.div>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {contactMethods.map((method, index) => (
            <motion.div
              key={method.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group"
            >
              <div className="bg-gradient-to-br from-crys-graphite/40 to-crys-graphite/20 rounded-2xl p-8 backdrop-blur-sm border border-crys-gold/20 hover:border-crys-gold/40 transition-all duration-300 h-full">
                <div className={`w-16 h-16 bg-gradient-to-br ${method.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <method.icon className="w-8 h-8 text-crys-gold" />
                </div>
                
                <h3 className="text-2xl font-bold text-crys-gold mb-4">{method.title}</h3>
                <p className="text-gray-300 mb-6">{method.description}</p>
                
                <motion.a
                  href={method.href}
                  target={method.href.startsWith('http') ? '_blank' : undefined}
                  rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-crys-gold/10 text-crys-gold rounded-xl border border-crys-gold/20 hover:bg-crys-gold/20 hover:border-crys-gold/40 transition-all duration-300 group/link"
                >
                  {method.action}
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-200" />
                </motion.a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main CTA */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="bg-gradient-to-br from-crys-graphite/40 to-crys-graphite/20 rounded-3xl p-12 backdrop-blur-sm border border-crys-gold/20 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 20% 20%, #D4AF37 2px, transparent 2px)`,
                backgroundSize: '40px 40px'
              }}></div>
            </div>

            <div className="relative z-10 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                viewport={{ once: true }}
                className="inline-block mb-8"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-crys-gold to-crys-gold-muted rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-crys-gold/20">
                  <Zap className="w-10 h-10 text-black" />
                </div>
              </motion.div>

              <h3 className="text-4xl md:text-5xl font-bold text-crys-gold mb-6">
                Ready to Get Started?
              </h3>
              <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                Experience the future of audio mastering with Crysgarage's revolutionary technology. 
                Join thousands of artists who trust our platform for professional-grade results.
              </p>

              {/* Feature highlights */}
              <div className="flex flex-wrap justify-center gap-6 mb-10">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.text}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-2 text-crys-gold"
                  >
                    <feature.icon className="w-5 h-5" />
                    <span className="text-lg font-medium">{feature.text}</span>
                  </motion.div>
                ))}
              </div>

              <motion.a
                href="/"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-3 px-12 py-6 bg-gradient-to-r from-crys-gold to-crys-gold-muted text-black font-bold text-xl rounded-2xl shadow-2xl shadow-crys-gold/20 hover:shadow-crys-gold/30 transition-all duration-300 group/cta"
              >
                Try Our Mastering App
                <ArrowRight className="w-6 h-6 group-hover/cta:translate-x-1 transition-transform duration-200" />
              </motion.a>

              <p className="text-gray-400 text-sm mt-6">
                No credit card required • Start mastering in seconds
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;

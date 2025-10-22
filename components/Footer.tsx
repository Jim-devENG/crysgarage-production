import { motion } from "framer-motion";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin,
  Music,
  Users,
  HelpCircle,
  ExternalLink,
  Heart
} from "lucide-react";
import { CrysGarageLogo } from './CrysGarageLogo';

interface FooterProps {
  onNavigate?: (section: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const socialMediaLinks = [
    {
      name: "Instagram",
      icon: <Instagram className="w-5 h-5" />,
      url: "https://www.instagram.com/crysgarage/",
      color: "hover:text-pink-400"
    }
    // Commented out for now - will be used later
    // {
    //   name: "Twitter/X",
    //   icon: <Twitter className="w-5 h-5" />,
    //   url: "https://twitter.com/crysgarage",
    //   color: "hover:text-blue-400"
    // },
    // {
    //   name: "Facebook",
    //   icon: <Facebook className="w-5 h-5" />,
    //   url: "https://facebook.com/crysgarage",
    //   color: "hover:text-blue-600"
    // },
    // {
    //   name: "YouTube",
    //   icon: <Youtube className="w-5 h-5" />,
    //   url: "https://youtube.com/@crysgarage",
    //   color: "hover:text-red-500"
    // },
    // {
    //   name: "LinkedIn",
    //   icon: <Linkedin className="w-5 h-5" />,
    //   url: "https://linkedin.com/company/crysgarage",
    //   color: "hover:text-blue-700"
    // }
  ];

  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Studio", href: "/studio" },
    { name: "About Us", href: "/about" },
    { name: "Help Center", href: "/help" },
    { name: "Community", href: "/community" },
    // { name: "Courses", href: "/courses" }
  ];

  const companyLinks = [
    { name: "Privacy Policy", page: "privacy" },
    { name: "Terms of Service", page: "terms" },
    { name: "Cookie Policy", page: "cookies" },
    { name: "Support", page: "support" },
    { name: "Careers", page: "careers" }
  ];

  const contactInfo = [
    {
      icon: <Mail className="w-4 h-4" />,
      label: "Email",
      value: "info@crysgarage.studio",
      href: "mailto:info@crysgarage.studio"
    },
    {
      icon: <MapPin className="w-4 h-4" />,
      label: "Location",
      value: "Nigeria",
      href: "#"
    }
  ];

  const handleNavigation = (href: string) => {
    if (href.startsWith('/') && onNavigate) {
      const section = href.substring(1) || 'landing';
      onNavigate(section);
    } else if (href.startsWith('http')) {
      window.open(href, '_blank', 'noopener,noreferrer');
    } else if (onNavigate) {
      // Handle direct page names (for company links)
      onNavigate(href);
    }
  };

  return (
    <footer className="bg-gradient-to-br from-crys-black via-crys-charcoal to-crys-black border-t border-crys-graphite relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-crys-gold/5 via-transparent to-crys-gold/5"></div>
        
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
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
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <motion.div 
              className="lg:col-span-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-1 mb-6">
                <div className="flex items-center justify-center mt-3 -mr-2">
                  <CrysGarageLogo className="w-4 h-4" />
                </div>
                <span className="text-2xl font-bold text-crys-white">Crys Garage</span>
              </div>
              <p className="text-crys-light-grey mb-6 leading-relaxed">
                The African Music Mastering Revolution. Professional audio mastering platform 
                designed for African artists and producers.
              </p>
              
              {/* Social Media Links */}
              <div className="flex items-center gap-4">
                {socialMediaLinks.map((social, index) => (
                  <motion.a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-crys-light-grey hover:text-crys-gold transition-colors duration-300 ${social.color}`}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-crys-white font-semibold text-lg mb-6 flex items-center gap-2">
                <Music className="w-5 h-5 text-crys-gold" />
                Quick Links
              </h3>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <motion.li
                    key={link.name}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 + index * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <button
                      onClick={() => handleNavigation(link.href)}
                      className="text-crys-light-grey hover:text-crys-gold transition-colors duration-300 flex items-center gap-2 group"
                    >
                      <span>{link.name}</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </button>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Company Links */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-crys-white font-semibold text-lg mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-crys-gold" />
                Company
              </h3>
              <ul className="space-y-3">
                {companyLinks.map((link, index) => (
                  <motion.li
                    key={link.name}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <button
                      onClick={() => handleNavigation(link.page)}
                      className="text-crys-light-grey hover:text-crys-gold transition-colors duration-300 flex items-center gap-2 group"
                    >
                      <span>{link.name}</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </button>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Contact Info */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h3 className="text-crys-white font-semibold text-lg mb-6 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-crys-gold" />
                Contact Us
              </h3>
              <div className="space-y-4">
                {contactInfo.map((contact, index) => (
                  <motion.div
                    key={contact.label}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.05 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-3"
                  >
                    <div className="text-crys-gold mt-0.5">
                      {contact.icon}
                    </div>
                    <div>
                      <p className="text-crys-light-grey text-sm font-medium">{contact.label}</p>
                      <a
                        href={contact.href}
                        className="text-crys-white hover:text-crys-gold transition-colors duration-300 text-sm"
                      >
                        {contact.value}
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Bar */}
        <motion.div 
          className="border-t border-crys-graphite py-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-crys-light-grey text-sm">
              <span>© {currentYear} Crys Garage. All rights reserved.</span>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:inline">Made with</span>
              <Heart className="w-4 h-4 text-red-500 hidden md:inline" />
              <span className="hidden md:inline">in Africa</span>
            </div>
            
            <div className="flex items-center gap-6 text-crys-light-grey text-sm">
              <span>Follow us:</span>
              <div className="flex items-center gap-3">
                {socialMediaLinks.slice(0, 3).map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`hover:text-crys-gold transition-colors duration-300 ${social.color}`}
                    title={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

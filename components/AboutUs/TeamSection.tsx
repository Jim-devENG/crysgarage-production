import React from 'react';
import { motion } from 'framer-motion';
import { Linkedin, Github, Mail, ExternalLink } from 'lucide-react';

const TeamSection: React.FC = () => {
  const teamMembers = [
    {
      name: "Jimmy De Billionaire",
      role: "Software Engineer",
      image: "/Jim.png",
      linkedin: "https://www.linkedin.com/in/enietan-jimmy/",
      description: "Architects intelligent systems and scalable platforms; built crysgarage.studio end‑to‑end with a focus on performance and user experience.",
      skills: ["Full-Stack Development", "System Architecture", "Performance Optimization"],
      color: "from-blue-500/20 to-blue-600/10"
    },
    {
      name: "Supernova",
      role: "Expert Sound Engineer & Producer", 
      image: "/Shed.png",
      linkedin: "https://www.linkedin.com/in/shadrach-ishaya-0b760459/",
      description: "Master of audio engineering with deep expertise in mastering techniques and professional sound production.",
      skills: ["Audio Engineering", "Mastering", "Sound Design"],
      color: "from-purple-500/20 to-purple-600/10"
    },
    {
      name: "Jusi",
      role: "SaaS Project Manager",
      image: "/Jusi.png", 
      linkedin: "https://www.linkedin.com/in/jerry-ishaya-b7734123a/",
      description: "Leads product planning and delivery for SaaS; aligns engineering, design, and business goals to ship quality experiences.",
      skills: ["Project Management", "Product Strategy", "Team Leadership"],
      color: "from-green-500/20 to-green-600/10"
    },
    {
      name: "Ypee",
      role: "Digital Marketer",
      image: "/Ypeeee.png",
      linkedin: "https://www.linkedin.com/in/ephraim-samuel-54b690209?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
      description: "Strategic digital marketing specialist driving growth and connecting African artists with global audiences.",
      skills: ["Digital Marketing", "Growth Strategy", "Brand Development"],
      color: "from-orange-500/20 to-orange-600/10"
    }
  ];

  return (
    <section className="py-24 px-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(45deg, #D4AF37 1px, transparent 1px), linear-gradient(-45deg, #D4AF37 1px, transparent 1px)`,
          backgroundSize: '30px 30px'
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
              <Linkedin className="w-8 h-8 text-black" />
            </div>
          </motion.div>

          <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-crys-gold via-crys-gold-muted to-crys-gold bg-clip-text text-transparent mb-8">
            Meet Our Team
          </h2>
          <p className="text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            The passionate developers and audio engineers behind Crys Garage
          </p>
        </motion.div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -10 }}
              className="group relative"
            >
              <div className="bg-gradient-to-br from-crys-graphite/40 to-crys-graphite/20 rounded-3xl p-8 backdrop-blur-sm border border-crys-gold/20 hover:border-crys-gold/40 transition-all duration-500 h-full">
                {/* Profile Image */}
                <div className="relative mb-6">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                    className="w-32 h-32 mx-auto relative"
                  >
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full rounded-full object-cover border-4 border-crys-gold/20 group-hover:border-crys-gold/40 transition-all duration-300"
                    />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-crys-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </motion.div>
                  
                  {/* Status indicator */}
                  <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
                </div>

                {/* Name and Role */}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-crys-gold mb-2 group-hover:text-crys-gold-muted transition-colors duration-300">
                    {member.name}
                  </h3>
                  <p className="text-crys-gold/80 font-medium text-lg mb-4">{member.role}</p>
                  
                  {/* Skills */}
                  <div className="flex flex-wrap gap-2 justify-center mb-4">
                    {member.skills.map((skill, skillIndex) => (
                      <span
                        key={skillIndex}
                        className="px-3 py-1 bg-crys-gold/10 text-crys-gold text-xs rounded-full border border-crys-gold/20"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-300 text-center text-sm leading-relaxed mb-6">
                  {member.description}
                </p>

                {/* Social Links */}
                <div className="flex justify-center space-x-4">
                  <motion.a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 bg-gradient-to-br from-crys-gold/20 to-crys-gold/10 rounded-xl flex items-center justify-center text-crys-gold hover:from-crys-gold/30 hover:to-crys-gold/20 transition-all duration-300 group/link"
                  >
                    <Linkedin className="w-5 h-5 group-hover/link:scale-110 transition-transform duration-200" />
                  </motion.a>
                  
                  <motion.a
                    href={`mailto:${member.name.toLowerCase().replace(/\s+/g, '.')}@crysgarage.studio`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 bg-gradient-to-br from-crys-gold/20 to-crys-gold/10 rounded-xl flex items-center justify-center text-crys-gold hover:from-crys-gold/30 hover:to-crys-gold/20 transition-all duration-300 group/link"
                  >
                    <Mail className="w-5 h-5 group-hover/link:scale-110 transition-transform duration-200" />
                  </motion.a>
                </div>
              </div>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-crys-gold/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            </motion.div>
          ))}
        </div>

        {/* Team Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <div className="bg-gradient-to-br from-crys-graphite/30 to-crys-graphite/10 rounded-3xl p-12 backdrop-blur-sm border border-crys-gold/20">
            <h3 className="text-3xl font-bold text-crys-gold mb-8">Our Team Impact</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: "Years Combined Experience", value: "12+" },
                { label: "Projects Delivered", value: "45+" },
                { label: "Technologies Mastered", value: "14+" },
                { label: "Artists & Teams Served", value: "220+" }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
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

export default TeamSection;

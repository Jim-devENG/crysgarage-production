import React from 'react';
import { motion } from 'framer-motion';
import AboutHero from './AboutHero';
import VisionMission from './VisionMission';
import TeamSection from './TeamSection';
import ContactSection from './ContactSection';

const AboutUs: React.FC = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background for the page content only */}
      <div className="absolute inset-0 bg-gradient-to-br from-crys-black via-crys-graphite to-crys-black -z-10"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20 -z-10">
        {[...Array(8)].map((_, i) => (
          <div
            key={`bg-wave-${i}`}
            className="absolute h-px bg-gradient-to-r from-transparent via-crys-gold to-transparent"
            style={{
              width: `${40 + i * 15}%`,
              top: `${10 + i * 12}%`,
              left: `${-10 + i * 5}%`,
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10">
        <AboutHero />
        <VisionMission />
        <TeamSection />
        <ContactSection />
      </div>
    </div>
  );
};

export default AboutUs;

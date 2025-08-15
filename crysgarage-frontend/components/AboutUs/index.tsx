import React from 'react';
import AboutHero from './AboutHero';
import VisionMission from './VisionMission';
import TeamSection from './TeamSection';
import TechnologyStack from './TechnologyStack';
import ContactSection from './ContactSection';

const AboutUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <AboutHero />
      <VisionMission />
      <TeamSection />
      <TechnologyStack />
      <ContactSection />
    </div>
  );
};

export default AboutUs;

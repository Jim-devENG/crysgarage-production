import React from 'react';

const TeamSection: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-gray-900">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-crys-gold mb-6">
          Meet Our Team
        </h2>
        <p className="text-xl text-gray-300 mb-12">
          The passionate developers and audio engineers behind Crysgarage
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-crys-graphite/30 rounded-2xl p-6 border border-crys-gold/10">
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face" 
                 alt="James Enietan" 
                 className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-crys-gold/20" />
            <h3 className="text-xl font-bold text-crys-gold mb-2">James Enietan</h3>
            <p className="text-crys-gold/80 font-medium mb-3">Full Stack Software Developer</p>
            <p className="text-gray-300 text-sm">Expert in React, Node.js, and modern web technologies. Building the digital foundation of Crys Garage.</p>
          </div>
          
          <div className="bg-crys-graphite/30 rounded-2xl p-6 border border-crys-gold/10">
            <img src="https://images.unsplash.com/photo-1494790108755-2616b2e00f02?w=400&h=400&fit=crop&crop=face" 
                 alt="Ishaya Shadrach" 
                 className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-crys-gold/20" />
            <h3 className="text-xl font-bold text-crys-gold mb-2">Ishaya Shadrach</h3>
            <p className="text-crys-gold/80 font-medium mb-3">Expert Sound Engineer & Producer</p>
            <p className="text-gray-300 text-sm">Master of audio engineering with deep expertise in mastering techniques and professional sound production.</p>
          </div>
          
          <div className="bg-crys-graphite/30 rounded-2xl p-6 border border-crys-gold/10">
            <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face" 
                 alt="Ishaya Jeremiah" 
                 className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-crys-gold/20" />
            <h3 className="text-xl font-bold text-crys-gold mb-2">Ishaya Jeremiah</h3>
            <p className="text-crys-gold/80 font-medium mb-3">Expert Digital Marketer</p>
            <p className="text-gray-300 text-sm">Strategic digital marketing specialist driving growth and connecting African artists with global audiences.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;

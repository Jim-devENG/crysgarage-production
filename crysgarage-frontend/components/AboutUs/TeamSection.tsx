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
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-crys-graphite/30 rounded-2xl p-6 border border-crys-gold/10">
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face" 
                 alt="Michael Nzy" 
                 className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-crys-gold/20" />
            <h3 className="text-xl font-bold text-crys-gold mb-2">Michael Nzy</h3>
            <p className="text-crys-gold/80 font-medium mb-3">Founder & Lead Developer</p>
            <p className="text-gray-300 text-sm">Full-stack developer with expertise in React, Node.js, and real-time audio processing.</p>
          </div>
          
          <div className="bg-crys-graphite/30 rounded-2xl p-6 border border-crys-gold/10">
            <img src="https://images.unsplash.com/photo-1494790108755-2616b2e00f02?w=400&h=400&fit=crop&crop=face" 
                 alt="Sarah Chen" 
                 className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-crys-gold/20" />
            <h3 className="text-xl font-bold text-crys-gold mb-2">Sarah Chen</h3>
            <p className="text-crys-gold/80 font-medium mb-3">Audio Engineer & AI Specialist</p>
            <p className="text-gray-300 text-sm">Audio engineering expert with deep knowledge in mastering techniques and DSP.</p>
          </div>
          
          <div className="bg-crys-graphite/30 rounded-2xl p-6 border border-crys-gold/10">
            <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face" 
                 alt="David Rodriguez" 
                 className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-crys-gold/20" />
            <h3 className="text-xl font-bold text-crys-gold mb-2">David Rodriguez</h3>
            <p className="text-crys-gold/80 font-medium mb-3">Backend Architect</p>
            <p className="text-gray-300 text-sm">Backend specialist focused on scalable architecture and real-time processing.</p>
          </div>
          
          <div className="bg-crys-graphite/30 rounded-2xl p-6 border border-crys-gold/10">
            <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face" 
                 alt="Emma Thompson" 
                 className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-crys-gold/20" />
            <h3 className="text-xl font-bold text-crys-gold mb-2">Emma Thompson</h3>
            <p className="text-crys-gold/80 font-medium mb-3">UX/UI Designer</p>
            <p className="text-gray-300 text-sm">Creative designer focused on creating intuitive and beautiful user experiences.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;

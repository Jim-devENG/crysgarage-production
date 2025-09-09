import React from 'react';
import { Linkedin } from 'lucide-react';

const TeamSection: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-gray-900">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-crys-gold mb-6">
          Meet Our Team
        </h2>
        <p className="text-xl text-gray-300 mb-12">
          The passionate developers and audio engineers behind Crys Garage
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-crys-graphite/30 rounded-2xl p-6 border border-crys-gold/10">
            <img src="/Jim.png" 
                 alt="James Enietan" 
                 className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-crys-gold/20" />
            <h3 className="text-xl font-bold text-crys-gold mb-2">
              <a href="https://www.linkedin.com/in/enietan-jimmy/" target="_blank" rel="noopener noreferrer" className="hover:underline">Jimmy De Billionaire</a>
            </h3>
            <p className="text-crys-gold/80 font-medium mb-3">Software Engineer</p>
            <p className="text-gray-300 text-sm">Architects intelligent systems and scalable platforms; built crysgarage.studio end‑to‑end with a focus on performance and user experience.</p>
            <div className="mt-4">
              <a href="https://www.linkedin.com/in/enietan-jimmy/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-crys-gold hover:underline">
                <Linkedin className="w-4 h-4" /> Contact
              </a>
            </div>
          </div>
          
          <div className="bg-crys-graphite/30 rounded-2xl p-6 border border-crys-gold/10">
            <img src="/Shed.png" 
                 alt="Ishaya Shadrach" 
                 className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-crys-gold/20" />
            <h3 className="text-xl font-bold text-crys-gold mb-2">
              <a href="https://www.linkedin.com/in/shadrach-ishaya-0b760459/" target="_blank" rel="noopener noreferrer" className="hover:underline">Supernova</a>
            </h3>
            <p className="text-crys-gold/80 font-medium mb-3">Expert Sound Engineer & Producer</p>
            <p className="text-gray-300 text-sm">Master of audio engineering with deep expertise in mastering techniques and professional sound production.</p>
            <div className="mt-4">
              <a href="https://www.linkedin.com/in/shadrach-ishaya-0b760459/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-crys-gold hover:underline">
                <Linkedin className="w-4 h-4" /> Contact
              </a>
            </div>
          </div>
          
          <div className="bg-crys-graphite/30 rounded-2xl p-6 border border-crys-gold/10">
            <img src="/Jusi.png" 
                 alt="Ishaya Jeremiah" 
                 className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-crys-gold/20" />
            <h3 className="text-xl font-bold text-crys-gold mb-2">
              <a href="https://www.linkedin.com/in/jerry-ishaya-b7734123a/" target="_blank" rel="noopener noreferrer" className="hover:underline">Jusi</a>
            </h3>
            <p className="text-crys-gold/80 font-medium mb-3">SaaS Project Manager</p>
            <p className="text-gray-300 text-sm">Leads product planning and delivery for SaaS; aligns engineering, design, and business goals to ship quality experiences.</p>
            <div className="mt-4">
              <a href="https://www.linkedin.com/in/jerry-ishaya-b7734123a/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-crys-gold hover:underline">
                <Linkedin className="w-4 h-4" /> Contact
              </a>
            </div>
          </div>

          <div className="bg-crys-graphite/30 rounded-2xl p-6 border border-crys-gold/10">
            <img src="/Ypeeee.png" 
                 alt="Ypee" 
                 className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-crys-gold/20" />
            <h3 className="text-xl font-bold text-crys-gold mb-2">
              <a href="https://www.linkedin.com/in/ephraim-samuel-54b690209?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" target="_blank" rel="noopener noreferrer" className="hover:underline">Ypee</a>
            </h3>
            <p className="text-crys-gold/80 font-medium mb-3">Digital Marketer</p>
            <p className="text-gray-300 text-sm">Strategic digital marketing specialist driving growth and connecting African artists with global audiences.</p>
            <div className="mt-4">
              <a href="https://www.linkedin.com/in/ephraim-samuel-54b690209?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-crys-gold hover:underline">
                <Linkedin className="w-4 h-4" /> Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;

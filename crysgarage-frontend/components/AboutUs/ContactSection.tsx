import React from 'react';

const ContactSection: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-gray-800">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-crys-gold mb-6">
          Get in Touch
        </h2>
        <p className="text-xl text-gray-300 mb-12">
          Have questions about our technology or want to collaborate? We'd love to hear from you.
        </p>
        
        <div className="bg-crys-graphite/30 rounded-2xl p-8 border border-crys-gold/10">
          <h3 className="text-2xl font-bold text-crys-gold mb-4">Ready to Get Started?</h3>
          <p className="text-gray-300 mb-6">
            Experience the future of audio mastering with Crysgarage's revolutionary technology.
          </p>
          <a
            href="/"
            className="inline-flex items-center px-8 py-4 bg-crys-gold hover:bg-crys-gold-muted text-black font-semibold rounded-lg transition-colors"
          >
            Try Our Mastering App
          </a>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;

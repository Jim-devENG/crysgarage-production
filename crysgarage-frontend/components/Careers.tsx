import React from 'react';
import { Users, Briefcase, Heart, Zap, Globe, Code } from 'lucide-react';

const Careers: React.FC = () => {


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-crys-gold to-orange-500 rounded-full">
              <Users className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-crys-gold to-orange-500 bg-clip-text text-transparent">
            Join Our Team
          </h1>
          <p className="text-xl text-gray-300">
            Help us revolutionize audio mastering with cutting-edge technology
          </p>
        </div>

        {/* Company Culture */}
        <div className="bg-gradient-to-r from-crys-gold/20 to-orange-500/20 rounded-lg p-8 border border-crys-gold/30 mb-12">
          <h2 className="text-2xl font-semibold text-center mb-6">Why Work at CrysGarage?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="p-3 bg-crys-gold/20 rounded-full w-fit mx-auto mb-4">
                <Heart className="w-8 h-8 text-crys-gold" />
              </div>
              <h3 className="text-lg font-medium mb-2">Passion for Audio</h3>
              <p className="text-gray-300 text-sm">We're passionate about music and audio technology, creating tools that empower artists worldwide.</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-crys-gold/20 rounded-full w-fit mx-auto mb-4">
                <Zap className="w-8 h-8 text-crys-gold" />
              </div>
              <h3 className="text-lg font-medium mb-2">Innovation First</h3>
              <p className="text-gray-300 text-sm">We push the boundaries of what's possible in audio processing and user experience.</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-crys-gold/20 rounded-full w-fit mx-auto mb-4">
                <Globe className="w-8 h-8 text-crys-gold" />
              </div>
              <h3 className="text-lg font-medium mb-2">Global Impact</h3>
              <p className="text-gray-300 text-sm">Your work will reach millions of artists and creators around the world.</p>
            </div>
          </div>
        </div>

        

        {/* Open Positions */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Open Positions</h2>
          <div className="text-center py-12">
            <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-8 max-w-md mx-auto">
              <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Open Positions</h3>
              <p className="text-gray-300 mb-6">
                We're not currently hiring, but we're always interested in connecting with talented individuals who share our passion for audio technology.
              </p>
              <div className="space-y-3">
                <p className="text-sm text-gray-400">
                  <strong>Interested in joining our team?</strong>
                </p>
                <p className="text-sm text-gray-300">
                  Send us your resume and a brief note about how you'd like to contribute to CrysGarage.
                </p>
                <button className="bg-crys-gold hover:bg-crys-gold/90 text-black font-semibold px-6 py-3 rounded-lg transition-colors duration-300 mt-4">
                  Send Resume
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Application Process */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Application Process</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-crys-gold/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-crys-gold font-bold">1</span>
              </div>
              <h3 className="font-medium mb-2">Apply</h3>
              <p className="text-gray-300 text-sm">Submit your application with resume and portfolio</p>
            </div>
            <div className="text-center">
              <div className="bg-crys-gold/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-crys-gold font-bold">2</span>
              </div>
              <h3 className="font-medium mb-2">Initial Review</h3>
              <p className="text-gray-300 text-sm">Our team reviews your application and experience</p>
            </div>
            <div className="text-center">
              <div className="bg-crys-gold/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-crys-gold font-bold">3</span>
              </div>
              <h3 className="font-medium mb-2">Interviews</h3>
              <p className="text-gray-300 text-sm">Technical and cultural fit interviews with the team</p>
            </div>
            <div className="text-center">
              <div className="bg-crys-gold/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-crys-gold font-bold">4</span>
              </div>
              <h3 className="font-medium mb-2">Decision</h3>
              <p className="text-gray-300 text-sm">We make our decision and extend an offer</p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-gradient-to-r from-crys-gold/20 to-orange-500/20 rounded-lg p-8 border border-crys-gold/30 text-center">
          <h2 className="text-2xl font-semibold mb-4">Don't See Your Role?</h2>
          <p className="text-gray-300 mb-6">We're always looking for talented individuals. Send us your resume.</p>
          <a href="mailto:career@crysgarage.studio" className="bg-crys-gold hover:bg-orange-500 text-black px-8 py-3 rounded-lg transition-colors inline-block">Email career@crysgarage.studio</a>
        </div>
      </div>
    </div>
  );
};

export default Careers;

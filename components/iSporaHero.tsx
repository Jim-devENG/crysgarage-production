import React from 'react';
import { Globe, Zap, Users, ArrowRight } from 'lucide-react';

export function iSporaHero() {
  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              {/* Tagline */}
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
                <Globe className="w-4 h-4 mr-2" />
                Building Global Impact Together
              </div>

                             {/* Main Headline */}
               <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                 iSpora:
                 <span className="block text-blue-700">
                   The Global Impact Engine
                 </span>
               </h1>
              
              {/* Subheadline */}
              <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-2xl leading-relaxed">
                Empowering communities worldwide through innovative technology, sustainable solutions, and collaborative partnerships that drive meaningful change.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl">
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
                <button className="inline-flex items-center px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors duration-200">
                  Learn More
                </button>
              </div>

              {/* Impact Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { value: "150+", label: "Countries Reached", color: "text-blue-600" },
                  { value: "2M+", label: "Lives Impacted", color: "text-green-600" },
                  { value: "500+", label: "Projects Completed", color: "text-purple-600" },
                  { value: "95%", label: "Success Rate", color: "text-orange-600" }
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
                <div className="text-center">
                  <Globe className="w-24 h-24 mx-auto mb-6 text-white/80" />
                  <h3 className="text-2xl font-bold mb-4">Global Impact Network</h3>
                  <p className="text-blue-100">
                    Connecting communities, driving innovation, and creating sustainable change across the world.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

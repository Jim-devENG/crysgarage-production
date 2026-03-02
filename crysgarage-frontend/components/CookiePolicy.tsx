import React from 'react';
import { Cookie, Settings, Eye, Shield, Database, Globe } from 'lucide-react';

const CookiePolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-crys-gold to-orange-500 rounded-full">
              <Cookie className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-crys-gold to-orange-500 bg-clip-text text-transparent">
            Cookie Policy
          </h1>
          <p className="text-xl text-gray-300">
            Learn about how we use cookies and similar technologies on CrysGarage.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Introduction */}
          <section className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Cookie className="w-6 h-6 mr-3 text-crys-gold" />
              What Are Cookies?
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Cookies are small text files that are stored on your device when you visit our website. 
              They help us provide you with a better experience by remembering your preferences, 
              analyzing how you use our site, and improving our services.
            </p>
          </section>

          {/* Types of Cookies */}
          <section className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Database className="w-6 h-6 mr-3 text-crys-gold" />
              Types of Cookies We Use
            </h2>
            
            <div className="space-y-6">
              {/* Essential Cookies */}
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="text-lg font-medium mb-2 text-green-400">Essential Cookies</h3>
                <p className="text-gray-300 mb-2">
                  These cookies are necessary for the website to function properly and cannot be disabled.
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>Authentication and login sessions</li>
                  <li>Security and fraud prevention</li>
                  <li>Load balancing and performance</li>
                  <li>Basic website functionality</li>
                </ul>
                <p className="text-sm text-gray-400 mt-2">
                  <strong>Duration:</strong> Session-based or up to 30 days
                </p>
              </div>

              {/* Functional Cookies */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-lg font-medium mb-2 text-blue-400">Functional Cookies</h3>
                <p className="text-gray-300 mb-2">
                  These cookies enhance your experience by remembering your preferences and settings.
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>Language and region preferences</li>
                  <li>Audio processing settings</li>
                  <li>User interface preferences</li>
                  <li>Theme and display options</li>
                </ul>
                <p className="text-sm text-gray-400 mt-2">
                  <strong>Duration:</strong> Up to 1 year
                </p>
              </div>

              {/* Analytics Cookies */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="text-lg font-medium mb-2 text-purple-400">Analytics Cookies</h3>
                <p className="text-gray-300 mb-2">
                  These cookies help us understand how visitors interact with our website.
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>Page views and navigation patterns</li>
                  <li>Feature usage and performance metrics</li>
                  <li>Error tracking and debugging</li>
                  <li>User journey analysis</li>
                </ul>
                <p className="text-sm text-gray-400 mt-2">
                  <strong>Duration:</strong> Up to 2 years
                </p>
              </div>

              {/* Marketing Cookies */}
              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="text-lg font-medium mb-2 text-orange-400">Marketing Cookies</h3>
                <p className="text-gray-300 mb-2">
                  These cookies are used to deliver relevant advertisements and track campaign effectiveness.
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>Ad targeting and personalization</li>
                  <li>Campaign performance tracking</li>
                  <li>Social media integration</li>
                  <li>Retargeting and remarketing</li>
                </ul>
                <p className="text-sm text-gray-400 mt-2">
                  <strong>Duration:</strong> Up to 1 year
                </p>
              </div>
            </div>
          </section>

          {/* Third-Party Cookies */}
          <section className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Globe className="w-6 h-6 mr-3 text-crys-gold" />
              Third-Party Cookies
            </h2>
            
            <div className="space-y-4">
              <p className="text-gray-300 leading-relaxed">
                We use third-party services that may set their own cookies:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-2 text-crys-gold">Firebase Authentication</h3>
                  <p className="text-gray-300 text-sm">
                    Google's authentication service for secure user login and session management.
                  </p>
                </div>
                
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-2 text-crys-gold">Paystack Payments</h3>
                  <p className="text-gray-300 text-sm">
                    Payment processing service for secure transaction handling.
                  </p>
                </div>
                
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-2 text-crys-gold">Google Analytics</h3>
                  <p className="text-gray-300 text-sm">
                    Website analytics to understand user behavior and improve our service.
                  </p>
                </div>
                
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-2 text-crys-gold">CDN Services</h3>
                  <p className="text-gray-300 text-sm">
                    Content delivery networks for fast and reliable service delivery.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Cookie Management */}
          <section className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Settings className="w-6 h-6 mr-3 text-crys-gold" />
              Managing Your Cookie Preferences
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2 text-crys-gold">Browser Settings</h3>
                <p className="text-gray-300 mb-3">
                  You can control cookies through your browser settings:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies and other site data</li>
                  <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
                  <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
                  <li><strong>Edge:</strong> Settings → Cookies and site permissions</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2 text-crys-gold">Cookie Consent</h3>
                <p className="text-gray-300 mb-3">
                  When you first visit our website, you'll see a cookie consent banner where you can:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>Accept all cookies</li>
                  <li>Reject non-essential cookies</li>
                  <li>Customize your preferences</li>
                  <li>Learn more about each cookie category</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2 text-crys-gold">Opt-Out Options</h3>
                <p className="text-gray-300 mb-3">
                  You can opt out of specific tracking:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li><strong>Google Analytics:</strong> <a href="https://tools.google.com/dlpage/gaoptout" className="text-crys-gold hover:underline" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out</a></li>
                  <li><strong>Ad Personalization:</strong> <a href="https://www.google.com/settings/ads" className="text-crys-gold hover:underline" target="_blank" rel="noopener noreferrer">Google Ad Settings</a></li>
                  <li><strong>Social Media:</strong> Manage preferences in your social media accounts</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Impact of Disabling Cookies */}
          <section className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Eye className="w-6 h-6 mr-3 text-crys-gold" />
              Impact of Disabling Cookies
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2 text-crys-gold">Essential Cookies</h3>
                <p className="text-gray-300">
                  Disabling essential cookies will prevent you from using our service, as they are required 
                  for basic functionality like authentication and security.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2 text-crys-gold">Functional Cookies</h3>
                <p className="text-gray-300">
                  Without functional cookies, you may need to re-enter your preferences each time you visit, 
                  and some personalized features may not work properly.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2 text-crys-gold">Analytics Cookies</h3>
                <p className="text-gray-300">
                  Disabling analytics cookies won't affect your experience, but it will prevent us from 
                  improving our service based on usage data.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2 text-crys-gold">Marketing Cookies</h3>
                <p className="text-gray-300">
                  Without marketing cookies, you may see less relevant advertisements, but this won't 
                  affect the core functionality of our service.
                </p>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Shield className="w-6 h-6 mr-3 text-crys-gold" />
              Cookie Security
            </h2>
            
            <div className="space-y-4">
              <p className="text-gray-300 leading-relaxed">
                We take cookie security seriously and implement various measures to protect your data:
              </p>
              
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li><strong>Secure Transmission:</strong> Cookies are transmitted over HTTPS connections</li>
                <li><strong>HttpOnly Flag:</strong> Sensitive cookies are protected from JavaScript access</li>
                <li><strong>SameSite Attribute:</strong> Prevents cross-site request forgery attacks</li>
                <li><strong>Regular Updates:</strong> We regularly review and update our cookie practices</li>
                <li><strong>Data Minimization:</strong> We only collect necessary data through cookies</li>
              </ul>
            </div>
          </section>

          {/* Updates to Cookie Policy */}
          <section className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4">Updates to This Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              We may update this Cookie Policy from time to time to reflect changes in our practices 
              or for other operational, legal, or regulatory reasons. We will notify you of any material 
              changes by posting the updated policy on our website and updating the "Last updated" date.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-gradient-to-r from-crys-gold/20 to-orange-500/20 rounded-lg p-6 border border-crys-gold/30 text-center">
            <h2 className="text-2xl font-semibold mb-4">Questions About Cookies?</h2>
            <a href="mailto:policy@crysgarage.studio" className="inline-block bg-crys-gold hover:bg-orange-500 text-black font-semibold px-6 py-3 rounded-lg transition-colors">Email policy@crysgarage.studio</a>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;

import React from 'react';
import { Shield, Lock, Eye, Database, UserCheck, Globe } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-crys-gold to-orange-500 rounded-full">
              <Shield className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-crys-gold to-orange-500 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-300">
            Your privacy is our priority. Learn how we protect and handle your data.
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
              <Lock className="w-6 h-6 mr-3 text-crys-gold" />
              Introduction
            </h2>
            <p className="text-gray-300 leading-relaxed">
              CrysGarage ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you use our audio 
              mastering platform and services. Please read this privacy policy carefully.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Database className="w-6 h-6 mr-3 text-crys-gold" />
              Information We Collect
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2 text-crys-gold">Personal Information</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>Email address and authentication credentials</li>
                  <li>Name and profile information</li>
                  <li>Payment and billing information (processed securely through Paystack)</li>
                  <li>Account preferences and settings</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2 text-crys-gold">Audio Data</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>Audio files you upload for mastering</li>
                  <li>Processing preferences and genre selections</li>
                  <li>Mastered audio outputs (temporarily stored)</li>
                  <li>Usage analytics and processing statistics</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2 text-crys-gold">Technical Information</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>IP address and device information</li>
                  <li>Browser type and version</li>
                  <li>Operating system details</li>
                  <li>Usage patterns and platform interactions</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Information */}
          <section className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Eye className="w-6 h-6 mr-3 text-crys-gold" />
              How We Use Your Information
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-2 text-crys-gold">Service Provision</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>Process and master your audio files</li>
                  <li>Provide real-time audio processing</li>
                  <li>Manage your account and preferences</li>
                  <li>Process payments and transactions</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2 text-crys-gold">Platform Improvement</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>Analyze usage patterns and performance</li>
                  <li>Improve audio processing algorithms</li>
                  <li>Develop new features and capabilities</li>
                  <li>Optimize user experience</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Shield className="w-6 h-6 mr-3 text-crys-gold" />
              Data Security
            </h2>
            
            <div className="space-y-4">
              <p className="text-gray-300 leading-relaxed">
                We implement industry-standard security measures to protect your data:
              </p>
              
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li><strong>Encryption:</strong> All data is encrypted in transit and at rest using AES-256 encryption</li>
                <li><strong>Secure Storage:</strong> Audio files are stored temporarily and automatically deleted after processing</li>
                <li><strong>Access Controls:</strong> Strict access controls and authentication protocols</li>
                <li><strong>Regular Audits:</strong> Security audits and vulnerability assessments</li>
                <li><strong>Payment Security:</strong> PCI DSS compliant payment processing through Paystack</li>
              </ul>
            </div>
          </section>

          {/* Data Sharing */}
          <section className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Globe className="w-6 h-6 mr-3 text-crys-gold" />
              Data Sharing and Disclosure
            </h2>
            
            <p className="text-gray-300 leading-relaxed mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share information only in the following circumstances:
            </p>
            
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li><strong>Service Providers:</strong> Trusted third-party services (Paystack for payments, Firebase for authentication)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In case of merger, acquisition, or asset sale</li>
              <li><strong>Consent:</strong> When you explicitly consent to sharing</li>
            </ul>
          </section>

          {/* Your Rights */}
          <section className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <UserCheck className="w-6 h-6 mr-3 text-crys-gold" />
              Your Rights
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-2 text-crys-gold">Data Access & Control</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>Access your personal data</li>
                  <li>Update or correct information</li>
                  <li>Delete your account and data</li>
                  <li>Export your data</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2 text-crys-gold">Privacy Controls</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>Opt-out of marketing communications</li>
                  <li>Control cookie preferences</li>
                  <li>Manage data processing consent</li>
                  <li>Request data portability</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Cookies */}
          <section className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4">Cookies and Tracking</h2>
            <p className="text-gray-300 leading-relaxed">
              We use cookies and similar technologies to enhance your experience, analyze usage, and provide 
              personalized content. You can control cookie preferences through your browser settings. 
              For detailed information, please see our Cookie Policy.
            </p>
          </section>

          {/* Data Retention */}
          <section className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
            <div className="space-y-3">
              <p className="text-gray-300 leading-relaxed">
                We retain your data only as long as necessary:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-1">
                <li><strong>Audio Files:</strong> Automatically deleted 10 minutes after processing</li>
                <li><strong>Account Data:</strong> Retained while your account is active</li>
                <li><strong>Usage Analytics:</strong> Aggregated data retained for 2 years</li>
                <li><strong>Payment Records:</strong> Retained as required by law (typically 7 years)</li>
              </ul>
            </div>
          </section>

          {/* International Transfers */}
          <section className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4">International Data Transfers</h2>
            <p className="text-gray-300 leading-relaxed">
              Your data may be transferred to and processed in countries other than your own. We ensure 
              appropriate safeguards are in place to protect your data in accordance with applicable 
              privacy laws and regulations.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
            <p className="text-gray-300 leading-relaxed">
              Our services are not intended for children under 13 years of age. We do not knowingly 
              collect personal information from children under 13. If you believe we have collected 
              information from a child under 13, please contact us immediately.
            </p>
          </section>

          {/* Changes to Policy */}
          <section className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material 
              changes by posting the new Privacy Policy on this page and updating the "Last updated" date. 
              Your continued use of our services after any modifications constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact Information */}
          <section className="bg-gradient-to-r from-crys-gold/20 to-orange-500/20 rounded-lg p-6 border border-crys-gold/30">
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="space-y-2 text-gray-300">
              <p><strong>Email:</strong> crysgaragestudio@gmail.com</p>
              <p><strong>Phone:</strong> 08069919304</p>
              <p><strong>WhatsApp:</strong> +234 806 991 9304</p>
              <p><strong>Location:</strong> Plateau, Nigeria</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

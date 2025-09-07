import React from 'react';
import { FileText, Scale, AlertTriangle, CreditCard, Shield, Users } from 'lucide-react';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-crys-gold to-orange-500 rounded-full">
              <FileText className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-crys-gold to-orange-500 bg-clip-text text-transparent">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-300">
            Please read these terms carefully before using CrysGarage services.
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
              <Scale className="w-6 h-6 mr-3 text-crys-gold" />
              Agreement to Terms
            </h2>
            <p className="text-gray-300 leading-relaxed">
              By accessing and using CrysGarage ("the Service"), you accept and agree to be bound by the 
              terms and provision of this agreement. If you do not agree to abide by the above, please 
              do not use this service.
            </p>
          </section>

          {/* Service Description */}
          <section className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4">Service Description</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              CrysGarage is an online audio mastering platform that provides:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Real-time audio mastering with genre-specific presets</li>
              <li>Professional-grade audio processing algorithms</li>
              <li>Multiple output formats (MP3, WAV 16/24/32-bit)</li>
              <li>Sample rate conversion capabilities</li>
              <li>G-Tuner pitch correction features</li>
              <li>Credit-based pricing system</li>
            </ul>
          </section>

          {/* User Accounts */}
          <section className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Users className="w-6 h-6 mr-3 text-crys-gold" />
              User Accounts
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2 text-crys-gold">Account Creation</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>You must provide accurate and complete information</li>
                  <li>You are responsible for maintaining account security</li>
                  <li>One account per person or entity</li>
                  <li>You must be at least 13 years old to create an account</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2 text-crys-gold">Account Responsibilities</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>Keep your login credentials secure and confidential</li>
                  <li>Notify us immediately of any unauthorized access</li>
                  <li>You are responsible for all activities under your account</li>
                  <li>Maintain accurate and up-to-date information</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Payment Terms */}
          <section className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <CreditCard className="w-6 h-6 mr-3 text-crys-gold" />
              Payment Terms
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2 text-crys-gold">Pricing and Credits</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>Free Tier: $2.99 per download (pay-per-use)</li>
                  <li>Professional Tier: $14.99 for 6 credits</li>
                  <li>Advanced Tier: $25 for 6 credits (5 + 1 bonus)</li>
                  <li>All prices are in USD and subject to applicable taxes</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2 text-crys-gold">Payment Processing</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>Payments are processed securely through Paystack</li>
                  <li>All transactions are final and non-refundable</li>
                  <li>Credits do not expire but are non-transferable</li>
                  <li>We reserve the right to change pricing with 30 days notice</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2 text-crys-gold">Refund Policy</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>No refunds for completed audio processing</li>
                  <li>Refunds may be considered for technical failures</li>
                  <li>Unused credits are non-refundable</li>
                  <li>Contact support for refund requests</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Acceptable Use */}
          <section className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <AlertTriangle className="w-6 h-6 mr-3 text-crys-gold" />
              Acceptable Use Policy
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2 text-crys-gold">Permitted Uses</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>Personal and commercial audio mastering projects</li>
                  <li>Music production and content creation</li>
                  <li>Educational and research purposes</li>
                  <li>Professional audio post-production</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2 text-crys-gold">Prohibited Uses</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>Uploading copyrighted material without permission</li>
                  <li>Processing illegal or harmful content</li>
                  <li>Attempting to reverse engineer our algorithms</li>
                  <li>Using automated tools to abuse the service</li>
                  <li>Violating any applicable laws or regulations</li>
                  <li>Sharing account credentials with others</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Intellectual Property */}
          <section className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4">Intellectual Property Rights</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2 text-crys-gold">Your Content</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>You retain all rights to your original audio content</li>
                  <li>You grant us a limited license to process your audio</li>
                  <li>You are responsible for ensuring you have rights to your content</li>
                  <li>We do not claim ownership of your audio files</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2 text-crys-gold">Our Technology</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>CrysGarage technology and algorithms are proprietary</li>
                  <li>You may not copy, modify, or distribute our software</li>
                  <li>All trademarks and logos are our property</li>
                  <li>You may not use our technology for competing services</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Service Availability */}
          <section className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4">Service Availability</h2>
            
            <div className="space-y-4">
              <p className="text-gray-300 leading-relaxed">
                We strive to maintain high service availability but cannot guarantee uninterrupted access:
              </p>
              
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li><strong>Uptime Target:</strong> 99.5% monthly availability</li>
                <li><strong>Maintenance:</strong> Scheduled maintenance with advance notice</li>
                <li><strong>Force Majeure:</strong> We are not liable for service interruptions beyond our control</li>
                <li><strong>Technical Issues:</strong> We will work to resolve issues promptly</li>
                <li><strong>Data Loss:</strong> We maintain backups but cannot guarantee against all data loss</li>
              </ul>
            </div>
          </section>

          {/* Privacy and Data */}
          <section className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Shield className="w-6 h-6 mr-3 text-crys-gold" />
              Privacy and Data Protection
            </h2>
            
            <p className="text-gray-300 leading-relaxed mb-4">
              Your privacy is important to us. Our data practices are governed by our Privacy Policy:
            </p>
            
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Audio files are automatically deleted 10 minutes after processing</li>
              <li>We do not store or share your audio content</li>
              <li>Personal data is protected with industry-standard security</li>
              <li>We comply with applicable privacy laws and regulations</li>
              <li>You can request data deletion at any time</li>
            </ul>
          </section>

          {/* Limitation of Liability */}
          <section className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
            
            <div className="space-y-4">
              <p className="text-gray-300 leading-relaxed">
                To the maximum extent permitted by law:
              </p>
              
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Our service is provided "as is" without warranties</li>
                <li>We are not liable for indirect, incidental, or consequential damages</li>
                <li>Our total liability is limited to the amount you paid for the service</li>
                <li>We are not responsible for third-party services or integrations</li>
                <li>You use the service at your own risk</li>
              </ul>
            </div>
          </section>

          {/* Termination */}
          <section className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4">Termination</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2 text-crys-gold">Account Termination</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>You may terminate your account at any time</li>
                  <li>We may suspend or terminate accounts for violations</li>
                  <li>Termination does not affect your liability for outstanding payments</li>
                  <li>Unused credits are forfeited upon termination</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2 text-crys-gold">Effect of Termination</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>Access to the service will be immediately revoked</li>
                  <li>Your data will be deleted according to our retention policy</li>
                  <li>Provisions that should survive termination will remain in effect</li>
                  <li>You remain liable for any outstanding obligations</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Governing Law */}
          <section className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4">Governing Law and Disputes</h2>
            
            <div className="space-y-4">
              <p className="text-gray-300 leading-relaxed">
                These terms are governed by the laws of [Your Jurisdiction]. Any disputes will be resolved through:
              </p>
              
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li><strong>Negotiation:</strong> Good faith efforts to resolve disputes amicably</li>
                <li><strong>Mediation:</strong> If negotiation fails, mediation may be required</li>
                <li><strong>Arbitration:</strong> Binding arbitration for unresolved disputes</li>
                <li><strong>Jurisdiction:</strong> Courts of [Your Jurisdiction] for legal proceedings</li>
              </ul>
            </div>
          </section>

          {/* Changes to Terms */}
          <section className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              We may update these Terms of Service from time to time. We will notify users of material 
              changes by email or through the service. Your continued use of the service after changes 
              constitutes acceptance of the updated terms.
            </p>
          </section>

          {/* Contact Information */}
          <section className="bg-gradient-to-r from-crys-gold/20 to-orange-500/20 rounded-lg p-6 border border-crys-gold/30">
            <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              If you have any questions about these Terms of Service, please contact us:
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

export default TermsOfService;

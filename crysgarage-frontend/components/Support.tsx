import React, { useState } from 'react';
import { HelpCircle, MessageCircle, Mail, Phone, Clock, Search, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

const Support: React.FC = () => {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      id: 1,
      question: "How do I get started with CrysGarage?",
      answer: "Getting started is easy! Simply create an account, upload your audio file, select a genre preset, and let the Crysgarage Mastering Engine process your track. You can start with our Free tier for $2.99 per download or choose a credit package for better value."
    },
    {
      id: 2,
      question: "What audio formats are supported?",
      answer: "We support most common audio formats including WAV, MP3, FLAC, and AIFF. For uploads, we recommend high-quality formats like WAV or FLAC for the best results. For downloads, you can choose from MP3 (320kbps) or WAV (16/24/32-bit) formats."
    },
    {
      id: 3,
      question: "How long does audio processing take?",
      answer: "Processing time depends on the length and complexity of your audio file. Most tracks are processed within 30-60 seconds. Longer files or complex arrangements may take up to 2-3 minutes. You'll see real-time progress updates during processing."
    },
    {
      id: 4,
      question: "What's the difference between the tiers?",
      answer: "Free Tier: $2.99 per download with basic mastering. Professional Tier: $14.99 for 6 credits with advanced genre presets and real-time processing. Advanced Tier: $25 for 6 credits (5+1 bonus) with premium features like G-Tuner, multiple sample rates, and high-bit-depth exports."
    },
    {
      id: 5,
      question: "Can I use the mastered audio commercially?",
      answer: "Yes! You retain all rights to your original content and the mastered output. You can use the mastered audio for commercial purposes, including music releases, content creation, and professional projects. We don't claim any ownership of your audio."
    },
    {
      id: 6,
      question: "How do credits work?",
      answer: "Credits are used to download mastered audio files. Each download costs 1 credit. Credits don't expire and are non-transferable. You can purchase additional credits anytime through your account dashboard."
    },
    {
      id: 7,
      question: "What is G-Tuner and how does it work?",
      answer: "G-Tuner is our pitch correction feature that applies +16 cents tuning to your audio. This is equivalent to 444Hz reference tuning and helps ensure your track is in perfect pitch. It's available in the Advanced tier and adds $3 to your download cost."
    },
    {
      id: 8,
      question: "Is my audio data secure?",
      answer: "Absolutely! We use industry-standard encryption (AES-256) for all data transmission and storage. Your audio files are automatically deleted 10 minutes after processing, and we never store or share your content. All processing happens in secure, isolated environments."
    },
    {
      id: 9,
      question: "Can I get a refund?",
      answer: "We offer refunds for technical failures or service issues. However, completed audio processing is generally non-refundable. If you experience any problems, please contact our support team and we'll work to resolve the issue or provide appropriate compensation."
    },
    {
      id: 10,
      question: "Do you offer API access?",
      answer: "Currently, we don't offer public API access. However, we're working on API solutions for developers and businesses. If you're interested in API integration, please contact us directly at crysgaragestudio@gmail.com to discuss your needs."
    }
  ];

  const filteredFAQs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFAQ = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-crys-gold to-orange-500 rounded-full">
              <HelpCircle className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-crys-gold to-orange-500 bg-clip-text text-transparent">
            Support Center
          </h1>
          <p className="text-xl text-gray-300">
            Get help with CrysGarage. We're here to assist you with any questions or issues.
          </p>
        </div>

        {/* Contact Options - email only */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 text-center md:col-start-2">
            <div className="p-3 bg-green-500/20 rounded-full w-fit mx-auto mb-4">
              <Mail className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Email Support</h3>
            <p className="text-gray-300 text-sm mb-4">Send us a detailed message</p>
            <a href="mailto:info@crysgarage.studio" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors inline-block">
              Send Email
            </a>
          </div>
        </div>

        {/* Support Hours */}
        <div className="bg-gradient-to-r from-crys-gold/20 to-orange-500/20 rounded-lg p-6 border border-crys-gold/30 mb-12">
          <div className="flex items-center justify-center mb-4">
            <Clock className="w-6 h-6 mr-3 text-crys-gold" />
            <h2 className="text-xl font-semibold">Support Hours</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <h3 className="font-medium text-crys-gold">Live Chat</h3>
              <p className="text-gray-300">24/7 Available</p>
            </div>
            <div>
              <h3 className="font-medium text-crys-gold">Email Support</h3>
              <p className="text-gray-300">Response within 24 hours</p>
            </div>
            <div>
              <h3 className="font-medium text-crys-gold">Phone Support</h3>
              <p className="text-gray-300">Mon-Fri 9AM-6PM EST</p>
            </div>
          </div>
        </div>

        {/* Search FAQ */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-crys-gold text-white"
            />
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {filteredFAQs.map((faq) => (
              <div key={faq.id} className="bg-gray-800/50 rounded-lg border border-gray-700">
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-700/50 transition-colors"
                >
                  <span className="font-medium">{faq.question}</span>
                  {expandedFAQ === faq.id ? (
                    <ChevronUp className="w-5 h-5 text-crys-gold" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-crys-gold" />
                  )}
                </button>
                {expandedFAQ === faq.id && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Quick Links</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <a href="/privacy-policy" className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 hover:border-crys-gold transition-colors group">
              <h3 className="text-lg font-semibold mb-2 group-hover:text-crys-gold transition-colors">Privacy Policy</h3>
              <p className="text-gray-300 text-sm">Learn how we protect your data and privacy</p>
            </a>

            <a href="/terms-of-service" className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 hover:border-crys-gold transition-colors group">
              <h3 className="text-lg font-semibold mb-2 group-hover:text-crys-gold transition-colors">Terms of Service</h3>
              <p className="text-gray-300 text-sm">Read our terms and conditions</p>
            </a>


            <a href="/cookie-policy" className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 hover:border-crys-gold transition-colors group">
              <h3 className="text-lg font-semibold mb-2 group-hover:text-crys-gold transition-colors">Cookie Policy</h3>
              <p className="text-gray-300 text-sm">Understand our cookie usage</p>
            </a>


            <a href="https://status.crysgarage.studio" target="_blank" rel="noopener noreferrer" className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 hover:border-crys-gold transition-colors group">
              <h3 className="text-lg font-semibold mb-2 group-hover:text-crys-gold transition-colors flex items-center">
                Service Status
                <ExternalLink className="w-4 h-4 ml-2" />
              </h3>
              <p className="text-gray-300 text-sm">Check our system status and uptime</p>
            </a>
          </div>
        </div>

        {/* Contact Information section removed as requested */}
      </div>
    </div>
  );
};

export default Support;

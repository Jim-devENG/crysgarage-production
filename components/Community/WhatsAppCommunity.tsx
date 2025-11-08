import React from 'react';
import { 
  Users, 
  MessageCircle, 
  Music, 
  Star, 
  Zap, 
  Heart, 
  ArrowRight,
  Shield,
  Sparkles,
  Mic,
  Headphones
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

export function WhatsAppCommunity() {
  const handleJoinWhatsApp = () => {
    window.open('https://chat.whatsapp.com/L1eDQaPVv5L2KZE0754QD3?mode=ems_copy_c', '_blank');
  };

  const communityStats = [
    { icon: Users, label: 'Active Members', value: '500+' },
    { icon: MessageCircle, label: 'Daily Messages', value: '1000+' },
    { icon: Music, label: 'Tracks Shared', value: '2000+' },
    { icon: Star, label: 'Success Stories', value: '150+' }
  ];

  const features = [
    {
      icon: Mic,
      title: 'Live Feedback Sessions',
      description: 'Get real-time feedback on your tracks from producers worldwide'
    },
    {
      icon: Headphones,
      title: 'Genre-Specific Channels',
      description: 'Join channels for Afrobeats, Gospel, Hip-Hop, and more'
    },
    {
      icon: Zap,
      title: 'Quick Tips & Tricks',
      description: 'Daily mastering tips and production techniques shared by experts'
    },
    {
      icon: Heart,
      title: 'Collaboration Opportunities',
      description: 'Connect with artists, producers, and engineers for projects'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-crys-gold/10 via-transparent to-crys-gold/10">
          <div className="absolute inset-0 opacity-20 bg-crys-gold/5"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="mb-8">
            <Badge variant="secondary" className="bg-crys-gold/20 text-crys-gold mb-6 px-4 py-2 text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Join the Movement
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="block text-crys-white">Connect with</span>
              <span className="block text-crys-gold bg-gradient-to-r from-crys-gold to-yellow-400 bg-clip-text text-transparent">
                Music Creators
              </span>
            </h1>
            
            <p className="text-xl text-crys-light-grey max-w-3xl mx-auto mb-8 leading-relaxed">
              Join our vibrant WhatsApp community of producers, artists, and audio engineers. 
              Share tracks, get feedback, collaborate, and grow together in the world of music production.
            </p>

            {/* Main CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button
                onClick={handleJoinWhatsApp}
                size="lg"
                className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black font-bold text-lg px-8 py-6 h-auto group transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-crys-gold/25"
              >
                <MessageCircle className="w-6 h-6 mr-3 group-hover:animate-bounce" />
                Join WhatsApp Community
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

          {/* Community Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {communityStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-crys-gold/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-8 h-8 text-crys-gold" />
                </div>
                <div className="text-2xl font-bold text-crys-gold mb-1">{stat.value}</div>
                <div className="text-sm text-crys-light-grey">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-crys-white mb-4">
            Why Join Our Community?
          </h2>
          <p className="text-xl text-crys-light-grey max-w-2xl mx-auto">
            Connect with like-minded creators and take your music to the next level
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="bg-audio-panel-bg border border-crys-graphite hover:border-crys-gold/50 transition-all duration-300 hover:scale-105 group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-crys-gold/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-crys-gold/30 transition-colors">
                  <feature.icon className="w-8 h-8 text-crys-gold" />
                </div>
                <CardTitle className="text-crys-white text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-crys-light-grey text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-crys-gold/10 to-crys-gold/5 border border-crys-gold/20 rounded-3xl p-12 text-center">
          <h2 className="text-4xl font-bold text-crys-white mb-4">
            Ready to Connect?
          </h2>
          <p className="text-xl text-crys-light-grey mb-8 max-w-2xl mx-auto">
            Join thousands of music creators in our WhatsApp community. 
            Start sharing, learning, and growing together today!
          </p>
          
          <Button
            onClick={handleJoinWhatsApp}
            size="lg"
            className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black font-bold text-lg px-10 py-6 h-auto group transition-all duration-300 transform hover:scale-105"
          >
            <MessageCircle className="w-6 h-6 mr-3 group-hover:animate-bounce" />
            Join Now - It's Free!
            <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
          </Button>

          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-crys-light-grey">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-crys-gold" />
              <span>Safe & Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-crys-gold" />
              <span>Global Community</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-crys-gold" />
              <span>Instant Access</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


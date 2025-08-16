import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  Check, 
  Star, 
  Zap, 
  Crown, 
  ArrowRight,
  Clock,
  Music,
  Download,
  Users
} from "lucide-react";

interface PricingPageProps {
  onSelectTier: (tierId: string) => void;
  onGoToDashboard: () => void;
  currentTier?: string;
}

export function PricingPage({ onSelectTier, onGoToDashboard }: PricingPageProps) {
  const handleTierSelection = (tierId: string) => {
    console.log('PricingPage: Tier selection clicked:', tierId);
    // Direct access to all tiers without payment popup
    onSelectTier(tierId);
    // Don't call onGoToDashboard here - let the App.tsx handle routing based on tier
  };

  const pricingTiers = [
    {
      id: "free",
      name: "Free Automatic",
      price: "Free",
      subtitle: "Get started with 5 free masters",
      description: "Perfect for trying out our platform",
      features: [
        "5 free mastering credits",
        "MP3/WAV upload (up to 60MB)",
        "44.1kHz sample rate",
        "16-bit resolution",
        "Playback preview only",
        "Basic genres ($1 each)",
        "No downloads on free credits"
      ],
      limitations: [
        "Cannot download free masters",
        "Premium features locked",
        "Limited file size"
      ],
      icon: <Star className="w-6 h-6" />,
      buttonText: "Try Free Trial",
      buttonVariant: "outline" as const,
      popular: false
    },
    {
      id: "professional",
      name: "Professional",
      price: "$9",
      subtitle: "100 mastering credits",
      description: "Perfect for active producers and artists",
      features: [
        "100 mastering credits",
        "All audio formats (up to 100MB)",
        "44.1kHz, 48kHz sample rates",
        "Up to 192kHz (+$5)",
        "16-bit resolution (24/32-bit +$1)",
        "Free: Pop, Rock, Reggae genres",
        "Premium genres ($1 each)",
        "444Hz tuning correction",
        "Noise reduction included",
        "Download WAV/MP3/FLAC"
      ],
      limitations: [
        "Some premium features cost extra",
        "Limited to 100 credits"
      ],
      icon: <Zap className="w-6 h-6" />,
      buttonText: "Try Professional",
      buttonVariant: "default" as const,
      popular: true
    },
    {
      id: "advanced",
      name: "Advanced Manual",
      price: "$20",
      subtitle: "Unlimited mastering",
      description: "Complete control for professionals",
      features: [
        "Unlimited mastering sessions",
        "All audio formats (unlimited size)",
        "All sample rates (44.1kHz - 192kHz)",
        "All bit depths (16/24/32-bit)",
        "All genres included",
        "444Hz tuning correction",
        "Real-time manual controls",
        "8-band graphic EQ",
        "Advanced compression settings",
        "Stereo imaging controls",
        "Limiter with custom settings",
        "A/B comparison",
        "Live preview & feedback"
      ],
      limitations: [],
      icon: <Crown className="w-6 h-6" />,
      buttonText: "Try Advanced",
      buttonVariant: "default" as const,
      popular: false
    }
  ];

  const additionalFeatures = [
    {
      icon: <Clock className="w-6 h-6 text-crys-gold" />,
      title: "Lightning Fast Processing",
      description: "Average processing time under 2 minutes"
    },
    {
      icon: <Music className="w-6 h-6 text-crys-gold" />,
      title: "Genre Optimization",
      description: "Specialized for Afrobeats, Gospel, Hip-Hop & more"
    },
    {
      icon: <Download className="w-6 h-6 text-crys-gold" />,
      title: "Streaming Ready",
      description: "Optimized for Spotify, Apple Music, YouTube"
    },
    {
      icon: <Users className="w-6 h-6 text-crys-gold" />,
      title: "24/7 Support",
      description: "Get help whenever you need it"
    }
  ];

  return (
    <div className="min-h-screen">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <Badge variant="secondary" className="bg-crys-gold/20 text-crys-gold mb-4">
            Studio Access
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-crys-white mb-6">
            Choose Your
            <span className="block text-crys-gold">Mastering Experience</span>
          </h1>
          <p className="text-xl text-crys-light-grey mb-8">
            Professional audio mastering for every need and budget. Start free, upgrade anytime.
          </p>
          
          <div className="flex items-center justify-center gap-6 text-sm text-crys-light-grey">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-crys-gold" />
              <span>No setup fees</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-crys-gold" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-crys-gold" />
              <span>Instant results</span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-20">
          {pricingTiers.map((tier) => (
            <Card 
              key={tier.id}
              className={`
                relative transition-all duration-300 hover:scale-105
                ${tier.popular 
                  ? 'border-2 border-crys-gold bg-gradient-to-b from-crys-gold/10 to-transparent shadow-2xl shadow-crys-gold/20' 
                  : 'border border-crys-graphite hover:border-crys-gold/50'
                }
                bg-audio-panel-bg
              `}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-crys-gold text-crys-black px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4 pt-8">
                <div className="w-16 h-16 bg-crys-gold/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-crys-gold">
                  {tier.icon}
                </div>
                <h3 className="text-2xl font-bold text-crys-white">{tier.name}</h3>
                <div className="flex items-baseline justify-center gap-1 mt-2">
                  <span className="text-4xl font-bold text-crys-gold">{tier.price}</span>
                  {tier.id !== "free" && (
                    <span className="text-crys-light-grey">/month</span>
                  )}
                </div>
                <p className="text-crys-gold text-sm mt-1">{tier.subtitle}</p>
                <p className="text-crys-light-grey text-sm mt-2">{tier.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-4 px-6">
                <div className="space-y-3">
                  <h4 className="text-crys-white font-medium">Features included:</h4>
                  {tier.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-crys-gold flex-shrink-0 mt-0.5" />
                      <span className="text-crys-light-grey text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                {tier.limitations.length > 0 && (
                  <div className="pt-4 border-t border-crys-graphite/50">
                    <h4 className="text-crys-light-grey text-sm font-medium mb-2">Limitations:</h4>
                    {tier.limitations.map((limitation, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-4 h-4 flex-shrink-0 mt-0.5">
                          <div className="w-2 h-2 bg-orange-400 rounded-full mt-1"></div>
                        </div>
                        <span className="text-crys-light-grey text-xs">{limitation}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="pt-0 px-6 pb-8">
                <div className="w-full space-y-3">
                  <Button 
                    className={`
                      w-full py-3
                      ${tier.buttonVariant === "default" 
                        ? "bg-crys-gold hover:bg-crys-gold-muted text-crys-black" 
                        : "border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10"
                      }
                    `}
                    variant={tier.buttonVariant}
                    onClick={() => handleTierSelection(tier.id)}
                  >
                    {tier.buttonText}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  
                  {tier.id === 'free' && (
                    <p className="text-xs text-center text-crys-light-grey">
                      No credit card required
                    </p>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Additional Features */}
        <div className="bg-crys-charcoal/30 rounded-3xl p-8 md:p-12 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-crys-white mb-4">
              Every Plan Includes
            </h2>
            <p className="text-crys-light-grey">
              Core features that make Crysgarage the best choice for audio mastering
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalFeatures.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-crys-gold/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-crys-white font-medium mb-2">{feature.title}</h3>
                <p className="text-crys-light-grey text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-crys-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            {[
              {
                question: "Can I upgrade or downgrade my plan?",
                answer: "Yes! You can change your plan anytime. Upgrades take effect immediately, and unused credits carry over."
              },
              {
                question: "What audio formats do you support?",
                answer: "We support WAV, MP3, FLAC, AAC, and OGG formats. Professional and Advanced tiers support all formats."
              },
              {
                question: "How long does mastering take?",
                answer: "Most tracks are processed in under 2 minutes. Complex tracks may take up to 5 minutes."
              },
              {
                question: "Do you offer refunds?",
                answer: "We offer a 30-day money-back guarantee if you're not satisfied with our service."
              }
            ].map((faq, index) => (
              <Card key={index} className="bg-audio-panel-bg border-audio-panel-border">
                <CardContent className="p-6">
                  <h3 className="text-crys-white font-medium mb-2">{faq.question}</h3>
                  <p className="text-crys-light-grey text-sm">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-crys-gold/10 via-crys-gold/5 to-crys-gold/10 rounded-2xl p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-crys-white mb-4">
              Ready to Start Mastering?
            </h2>
            <p className="text-crys-light-grey mb-6">
              Choose your plan above or jump straight into our mastering dashboard to get started.
            </p>
            <Button 
              size="lg"
              onClick={onGoToDashboard}
              className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black px-8"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
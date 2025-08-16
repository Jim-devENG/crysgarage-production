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
    
    if (tierId === 'free') {
      // For free tier, show authentication modal
      onSelectTier(tierId);
    } else {
      // For other tiers, direct access (as requested)
      onSelectTier(tierId);
    }
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
              <div className="container mx-auto px-6 sm:px-8 lg:px-12">
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
        <div className="grid lg:grid-cols-3 gap-4 max-w-4xl mx-auto mb-12">
          {pricingTiers.map((tier) => (
            <Card 
              key={tier.id}
              className={`
                relative transition-all duration-300 hover:scale-105
                ${tier.popular 
                  ? 'border-2 border-crys-gold bg-gradient-to-b from-crys-gold/10 to-transparent shadow-lg shadow-crys-gold/20' 
                  : 'border border-crys-graphite hover:border-crys-gold/50'
                }
                bg-audio-panel-bg
              `}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-crys-gold text-crys-black px-2 py-0.5 text-xs">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-2 pt-6">
                <div className="w-10 h-10 bg-crys-gold/20 rounded-lg flex items-center justify-center mx-auto mb-2 text-crys-gold">
                  {tier.icon}
                </div>
                <h3 className="text-lg font-bold text-crys-white">{tier.name}</h3>
                <div className="flex items-baseline justify-center gap-1 mt-1">
                  <span className="text-2xl font-bold text-crys-gold">{tier.price}</span>
                  {tier.id !== "free" && (
                    <span className="text-crys-light-grey text-sm">/month</span>
                  )}
                </div>
                <p className="text-crys-gold text-xs mt-1">{tier.subtitle}</p>
                <p className="text-crys-light-grey text-xs mt-1">{tier.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-2 px-4">
                <div className="space-y-1">
                  <h4 className="text-crys-white text-sm font-medium">Features:</h4>
                  {tier.features.slice(0, 4).map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="w-3 h-3 text-crys-gold flex-shrink-0 mt-0.5" />
                      <span className="text-crys-light-grey text-xs">{feature}</span>
                    </div>
                  ))}
                  {tier.features.length > 4 && (
                    <div className="text-crys-light-grey text-xs mt-1">
                      +{tier.features.length - 4} more features
                    </div>
                  )}
                </div>
                
                {tier.limitations.length > 0 && (
                  <div className="pt-2 border-t border-crys-graphite/50">
                    <h4 className="text-crys-light-grey text-xs font-medium mb-1">Limitations:</h4>
                    {tier.limitations.slice(0, 2).map((limitation, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-3 h-3 flex-shrink-0 mt-0.5">
                          <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-0.5"></div>
                        </div>
                        <span className="text-crys-light-grey text-xs">{limitation}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="pt-0 px-4 pb-4">
                <div className="w-full space-y-2">
                  <Button 
                    className={`
                      w-full py-2 text-sm
                      ${tier.buttonVariant === "default" 
                        ? "bg-crys-gold hover:bg-crys-gold-muted text-crys-black" 
                        : "border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10"
                      }
                    `}
                    variant={tier.buttonVariant}
                    onClick={() => handleTierSelection(tier.id)}
                  >
                    {tier.buttonText}
                    <ArrowRight className="w-3 h-3 ml-1" />
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




      </div>
    </div>
  );
}
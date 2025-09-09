import React, { useState } from "react";
import { Button } from "./ui/button";
import { useAuth } from "../contexts/AuthenticationContext";
import { initializeDirectPaystack } from "./Payments/PaystackDirect";
import { convertUSDToNGN, formatNGN } from "../utils/currencyConverter";
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
  Users,
  MessageCircle
} from "lucide-react";

interface PricingPageProps {
  onSelectTier: (tierId: string) => void;
  onGoToDashboard: () => void;
  currentTier?: string;
}

export function PricingPage({ onSelectTier, onGoToDashboard }: PricingPageProps) {
  const { user } = useAuth();

  // Modal state
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingTier, setPendingTier] = useState<null | { id: string; usd: number; ngnText: string; ngnCents: number; credits: number }>(null);

  const startDirectPayment = async (tierId: string) => {
    try {
      const priceMap: Record<string, number> = { professional: 15.00, advanced: 25.00, free: 3.00 };
      const creditsMap: Record<string, number> = { professional: 5, advanced: 6, free: 1 };
      const price = priceMap[tierId] ?? 0;
      const credits = creditsMap[tierId] ?? 0;
      
      // Convert USD to NGN for Paystack
      const currencyConversion = convertUSDToNGN(price);
      const reference = `CRYS_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      const tierKey = tierId === 'professional' ? 'pro' : tierId;
      const callbackUrl = `${window.location.origin}/billing?payment=success&tier=${tierKey}&credits=${credits}`;

      const authUrl = await initializeDirectPaystack({
        amountCents: currencyConversion.ngnCents, // Use NGN cents for Paystack
        email: user!.email,
        reference,
        callbackUrl,
        metadata: { 
          tier: tierKey, 
          credits, 
          user_id: user!.id,
          original_usd: price,
          converted_ngn: currencyConversion.ngn
        }
      });
      if (authUrl !== 'inline_redirect') {
        window.location.href = authUrl;
      }
    } catch (e) {
      console.error('Direct payment init failed:', e);
      // Fallback to previous flow
      onSelectTier(tierId);
    }
  };

  const handleTierSelection = (tierId: string) => {
    console.log('PricingPage: Tier selection clicked:', tierId);
    // Always delegate to parent component for consistent flow
    onSelectTier(tierId);
  };

  const pricingTiers = [
    {
      id: "free",
      name: "Pay Per Download",
      price: "$3.00",
      priceNGN: formatNGN(convertUSDToNGN(3.00).ngn),
      subtitle: "$3 for 1 download",
      description: "Perfect for occasional users",
      features: [
        "1 download credit",
        "MP3/WAV upload (up to 60MB)",
        "44.1kHz sample rate",
        "16-bit resolution",
        "Professional mastering",
        "Download in WAV/MP3/FLAC",
        "No subscription required"
      ],
      limitations: [
        "Pay per download only",
        "No free credits",
        "Limited file size"
      ],
      icon: <Star className="w-6 h-6" />,
      buttonText: "Pay Per Download",
      buttonVariant: "outline" as const,
      popular: false
    },
    {
      id: "professional",
      name: "Professional",
      price: "$15.00",
      priceNGN: formatNGN(convertUSDToNGN(15.00).ngn),
      subtitle: "5 credits ($3 per credit)",
      description: "Perfect for active producers and artists",
      features: [
        "5 download credits",
        "All audio formats (up to 100MB)",
        "44.1kHz, 48kHz sample rates",
        "16/24/32-bit resolution",
        "Advanced genre presets",
        "Noise reduction included",
        "+16 tuning correction",
        "Download WAV/MP3/FLAC",
        "Better value than pay-per-download"
      ],
      limitations: [
        "Credits required per download",
        "Max 5 downloads per pack"
      ],
      icon: <Zap className="w-6 h-6" />,
      buttonText: "Choose Professional",
      buttonVariant: "default" as const,
      popular: true
    },
    {
      id: "advanced",
      name: "Advanced Manual",
      price: "$25.00",
      priceNGN: formatNGN(convertUSDToNGN(25.00).ngn),
      subtitle: "5 credits + 1 bonus credit",
      description: "Full control for professionals",
      features: [
        "5 credits + 1 bonus credit",
        "Real-time manual controls",
        "8-band graphic EQ",
        "Advanced compression",
        "Stereo imaging controls",
        "Limiter settings",
        "A/B comparison",
        "All sample rates & formats",
        "+16 tuning (free)",
        "All genres included",
        "Live preview & feedback",
        "Best value with bonus credit"
      ],
      limitations: [
        "Credits required per download"
      ],
      icon: <Crown className="w-6 h-6" />,
      buttonText: "Choose Advanced",
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
            Professional audio mastering for every need and budget. Pay per credit, no subscriptions.
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
          
          {/* Currency Conversion Notice */}
          <div className="mt-4 p-3 bg-crys-gold/10 border border-crys-gold/20 rounded-lg max-w-md mx-auto">
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="text-crys-gold">💱</span>
              <span className="text-crys-light-grey">
                Prices shown in USD. Payments processed in NGN.
              </span>
            </div>
          </div>

          {/* Mastering Requirements Notice */}
          <div className="mt-4 p-4 bg-crys-gold/5 border border-crys-gold/20 rounded-lg max-w-2xl mx-auto">
            <div className="text-center">
              <h4 className="text-crys-gold font-semibold mb-2 text-sm">📋 Mastering Requirements</h4>
              <div className="flex flex-wrap justify-center gap-4 text-xs text-crys-light-grey">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                  <span>Min: -8 dB headroom</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                  <span>Max: -4 dB headroom</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-crys-gold rounded-full"></span>
                  <span>Best: -6 dB headroom</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span>Normalize audio</span>
                </div>
              </div>
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
                <div className="flex flex-col items-center justify-center gap-1 mt-1">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-2xl font-bold text-crys-gold">{tier.price}</span>
                  </div>
                  {tier.priceNGN && (
                    <span className="text-lg font-semibold text-crys-gold/80">{tier.priceNGN}</span>
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

        {/* Confirm Modal */}
        {showConfirm && pendingTier && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/70" onClick={() => setShowConfirm(false)} />
            <div className="relative w-full max-w-md mx-auto bg-audio-panel-bg border border-crys-gold/20 rounded-2xl shadow-xl p-6">
              <div className="text-center">
                <div className="mx-auto w-14 h-14 rounded-xl bg-crys-gold/15 border border-crys-gold/30 flex items-center justify-center mb-4">
                  <Crown className="w-6 h-6 text-crys-gold" />
                </div>
                <h3 className="text-crys-white text-xl font-semibold mb-1">Confirm Your Plan</h3>
                <p className="text-crys-light-grey text-sm mb-4">{pendingTier.id === 'professional' ? 'Professional' : 'Advanced'} • {pendingTier.credits} credits</p>
                <div className="bg-crys-graphite/40 rounded-lg p-3 border border-crys-graphite/60 mb-4">
                  <div className="text-crys-gold text-2xl font-bold">{pendingTier.ngnText}</div>
                  <div className="text-crys-light-grey text-xs">≈ ${pendingTier.usd.toFixed(2)} USD</div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button
                    className="py-2.5 rounded-lg border border-crys-graphite/60 text-crys-light-grey hover:bg-crys-graphite/40"
                    onClick={() => setShowConfirm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="py-2.5 rounded-lg bg-crys-gold text-crys-black font-semibold hover:bg-crys-gold/90"
                    onClick={() => {
                      const tierId = pendingTier.id;
                      setShowConfirm(false);
                      // proceed
                      startDirectPayment(tierId);
                    }}
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* One-on-One Mastering Service */}
        <div className="bg-gradient-to-r from-crys-gold/10 via-crys-gold/5 to-crys-gold/10 border border-crys-gold/30 rounded-3xl p-8 md:p-12 mb-16">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-crys-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-crys-gold" />
            </div>
            <h2 className="text-3xl font-bold text-crys-white mb-4">
              Need Personal Mastering?
            </h2>
            <p className="text-crys-light-grey text-lg max-w-2xl mx-auto">
              Want a professional engineer to master your track with personalized attention? 
              Get one-on-one mastering sessions with our expert engineers.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-crys-white mb-4">What You Get:</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-crys-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-crys-white font-medium">Personal Engineer</h4>
                    <p className="text-crys-light-grey text-sm">Work directly with a professional mastering engineer</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-crys-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-crys-white font-medium">Custom Approach</h4>
                    <p className="text-crys-light-grey text-sm">Tailored mastering for your specific sound and vision</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-crys-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-crys-white font-medium">Multiple Revisions</h4>
                    <p className="text-crys-light-grey text-sm">Unlimited revisions until you're completely satisfied</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-crys-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-crys-white font-medium">Fast Turnaround</h4>
                    <p className="text-crys-light-grey text-sm">Professional results delivered within 24-48 hours</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-crys-black/30 rounded-2xl p-6 border border-crys-gold/20">
                <h3 className="text-lg font-semibold text-crys-white mb-3">Ready to Get Started?</h3>
                <p className="text-crys-light-grey text-sm mb-4">
                  Contact us on WhatsApp to discuss your project and get a personalized quote.
                </p>
                <Button 
                  onClick={() => window.open('https://wa.me/2348069919304?text=Hi! I\'m interested in one-on-one mastering services. Can you tell me more about the process and pricing?', '_blank')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Contact on WhatsApp
                </Button>
                
              </div>
              
              <div className="text-center">
                <p className="text-crys-gold text-sm font-medium">
                  💬 Available 24/7 for consultations
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Features */}
        <div className="bg-crys-charcoal/30 rounded-3xl p-8 md:p-12 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-crys-white mb-4">
              Every Plan Includes
            </h2>
            <p className="text-crys-light-grey">
              Core features that make Crys Garage the best choice for audio mastering
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
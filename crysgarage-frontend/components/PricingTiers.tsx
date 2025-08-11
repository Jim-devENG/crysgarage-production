import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Check, Star, Zap, Crown } from "lucide-react";

interface PricingTier {
  id: string;
  name: string;
  price: string;
  credits: string;
  description: string;
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
  buttonText: string;
  buttonVariant: "default" | "outline" | "secondary";
}

interface PricingTiersProps {
  onTierSelect?: (tierId: string) => void;
  selectedTier?: string;
}

export function PricingTiers({ onTierSelect, selectedTier }: PricingTiersProps) {
  const tiers: PricingTier[] = [
    {
      id: "free",
      name: "Free Automatic",
      price: "Free",
      credits: "5 free masters",
      description: "Get started with basic mastering",
      features: [
        "5 free mastering credits",
        "MP3/WAV upload",
        "44.1kHz sample rate",
        "16-bit resolution",
        "Basic genre selection ($1 each)",
        "Playback preview only",
        "No downloads on free credits"
      ],
      icon: <Star className="w-6 h-6" />,
      buttonText: "Start Free",
      buttonVariant: "outline"
    },
    {
      id: "professional",
      name: "Professional",
      price: "$9",
      credits: "100 credits",
      description: "Perfect for active producers",
      features: [
        "100 mastering credits",
        "All audio formats",
        "Up to 192kHz sample rate",
        "24-bit/32-bit resolution ($1)",
        "Free: Pop, Rock, Reggae",
        "Premium genres ($1 each)",
        "444 tuning correction",
        "Noise reduction",
        "Download in WAV/MP3/FLAC"
      ],
      popular: true,
      icon: <Zap className="w-6 h-6" />,
      buttonText: "Get Professional",
      buttonVariant: "default"
    },
    {
      id: "advanced",
      name: "Advanced Manual",
      price: "$20",
      credits: "Unlimited",
      description: "Full control for professionals",
      features: [
        "Unlimited mastering",
        "Real-time manual controls",
        "8-band graphic EQ",
        "Advanced compression",
        "Stereo imaging controls",
        "Limiter settings",
        "A/B comparison",
        "All sample rates & formats",
        "444 tuning (free)",
        "All genres included",
        "Live preview & feedback"
      ],
      icon: <Crown className="w-6 h-6" />,
      buttonText: "Go Advanced",
      buttonVariant: "default"
    }
  ];

  return (
            <div>
      <div className="text-center mb-8">
        <h2 className="text-crys-white text-3xl mb-2">Choose Your Mastering Tier</h2>
        <p className="text-crys-light-grey">Professional audio mastering for every need and budget</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {tiers.map((tier) => (
          <Card 
            key={tier.id}
            className={`
              relative border-2 transition-all duration-200 cursor-pointer
              ${tier.popular 
                ? 'border-crys-gold bg-gradient-to-b from-crys-gold/10 to-transparent' 
                : 'border-crys-graphite hover:border-crys-gold/50'
              }
              ${selectedTier === tier.id ? 'border-crys-gold shadow-lg shadow-crys-gold/20' : ''}
              bg-audio-panel-bg
            `}
            onClick={() => onTierSelect?.(tier.id)}
          >
            {tier.popular && (
              <Badge 
                className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-crys-gold text-crys-black"
              >
                Most Popular
              </Badge>
            )}
            
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-crys-gold/20 rounded-lg flex items-center justify-center mx-auto mb-4 text-crys-gold">
                {tier.icon}
              </div>
              <h3 className="text-crys-white text-xl">{tier.name}</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-3xl font-bold text-crys-gold">{tier.price}</span>
                {tier.id !== "free" && tier.id !== "advanced" && (
                  <span className="text-crys-light-grey">/month</span>
                )}
              </div>
              <p className="text-crys-gold text-sm">{tier.credits}</p>
              <p className="text-crys-light-grey text-sm">{tier.description}</p>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {tier.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-crys-gold flex-shrink-0 mt-0.5" />
                  <span className="text-crys-white text-sm">{feature}</span>
                </div>
              ))}
            </CardContent>
            
            <CardFooter>
              <Button 
                variant={tier.buttonVariant}
                className={`
                  w-full
                  ${tier.buttonVariant === "default" 
                    ? "bg-crys-gold hover:bg-crys-gold-muted text-crys-black" 
                    : "border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10"
                  }
                `}
              >
                {tier.buttonText}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="text-center mt-8 p-4 bg-crys-graphite/20 rounded-lg max-w-2xl mx-auto">
        <p className="text-crys-light-grey text-sm">
          All plans include genre-specific optimization for Afrobeats, Gospel, Hip-Hop, and more. 
          Professional quality mastering with instant results.
        </p>
      </div>
    </div>
  );
}
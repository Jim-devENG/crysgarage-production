import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Check, Star, Zap, Crown } from "lucide-react";
import { motion } from "framer-motion";

interface PricingTier {
  id: string;
  name: string;
  price: string;
  credits: string;
  description: string;
  studioType?: string;
  studioDescription?: string;
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
      name: "Sapphire Studio",
      price: "$5.00",
      credits: "1 download",
      description: "$5 for 1 download",
      studioType: "Matchering Studio",
      studioDescription: "Crys Garage Engine mastering using advanced matchering technology that analyzes your reference track and applies professional mastering techniques automatically.",
      features: [
        "1 download credit",
        "MP3/WAV upload (up to 60MB)",
        "44.1kHz sample rate",
        "16-bit resolution",
        "Crys Garage Engine matchering technology",
        "Reference track analysis",
        "Automatic mastering application",
        "Professional quality output",
        "Download in WAV/MP3/FLAC",
        "No subscription required"
      ],
      icon: <Star className="w-6 h-6" />,
      buttonText: "Get Started",
      buttonVariant: "outline"
    },
    {
      id: "professional",
      name: "Emerald Studio",
      price: "$4.00",
      credits: "Per download",
      description: "$4 per download",
      studioType: "Crys Garage Engine Studio",
      studioDescription: "Our proprietary Crys Garage Engine delivers professional mastering with genre-specific optimization, advanced noise reduction, and real-time processing for the perfect sound.",
      features: [
        "Pay per download model",
        "All audio formats (up to 100MB)",
        "48kHz sample rate",
        "24-bit resolution",
        "Crys Garage Engine technology",
        "Genre-specific optimization",
        "Advanced noise reduction",
        "Real-time processing",
        "Africa first class genre presets",
        "Advanced genre presets",
        "+16 tuning correction",
        "Download in WAV/MP3/FLAC",
        "Professional mastering quality"
      ],
      popular: true,
      icon: <Zap className="w-6 h-6" />,
      buttonText: "Get Professional",
      buttonVariant: "default"
    },
    {
      id: "advanced",
      name: "Jasper Studio",
      price: "$25.00",
      credits: "5 + 1 bonus",
      description: "Best value with bonus credit",
      studioType: "Manual Control Studio",
      studioDescription: "Full manual control studio with real-time EQ, compression, and stereo imaging tools. Perfect for professional engineers who want complete creative control over their mastering process.",
      features: [
        "5 credits + 1 bonus credit",
        "Real-time manual controls",
        "8-band graphic EQ",
        "Advanced compression controls",
        "Stereo imaging tools",
        "A/B comparison",
        "Limiter settings",
        "All sample rates & formats",
        "+16 tuning (free)",
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
        {tiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.15,
                type: "spring",
                stiffness: 100,
                damping: 15
              }}
              whileHover={{ 
                y: -15, 
                scale: 1.05,
                rotateY: 5,
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.95 }}
              className="group"
            >
              <Card 
                className={`
                  relative border-2 transition-all duration-500 cursor-pointer group overflow-hidden
                  ${tier.id === 'free' 
                    ? 'border-blue-500 bg-gradient-to-b from-blue-500/10 to-blue-500/5 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/30' 
                    : tier.id === 'professional'
                    ? 'border-green-500 bg-gradient-to-b from-green-500/10 to-green-500/5 hover:border-green-400 hover:shadow-2xl hover:shadow-green-500/30'
                    : 'border-red-500 bg-gradient-to-b from-red-500/10 to-red-500/5 hover:border-red-400 hover:shadow-2xl hover:shadow-red-500/30'
                  }
                  ${tier.popular 
                    ? 'border-crys-gold bg-gradient-to-b from-crys-gold/10 to-transparent hover:shadow-2xl hover:shadow-crys-gold/30' 
                    : ''
                  }
                  ${selectedTier === tier.id ? 'border-crys-gold shadow-2xl shadow-crys-gold/30' : ''}
                  bg-audio-panel-bg backdrop-blur-sm
                  hover:bg-gradient-to-br hover:from-white/5 hover:to-transparent
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
              <motion.div 
                className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12 ${
                  tier.id === 'free' ? 'bg-blue-500/20 text-blue-400 group-hover:bg-blue-500/30 group-hover:text-blue-300' :
                  tier.id === 'professional' ? 'bg-green-500/20 text-green-400 group-hover:bg-green-500/30 group-hover:text-green-300' :
                  'bg-red-500/20 text-red-400 group-hover:bg-red-500/30 group-hover:text-red-300'
                }`}
                whileHover={{ 
                  scale: 1.2, 
                  rotate: 15,
                  transition: { duration: 0.3 }
                }}
              >
                {tier.icon}
              </motion.div>
              <h3 className="text-crys-white text-xl group-hover:text-crys-gold transition-colors duration-300">{tier.name}</h3>
              
              {/* Studio Type Badge */}
              <div className="mb-3">
                <Badge variant="outline" className="border-crys-gold/50 text-crys-gold text-xs">
                  {tier.studioType}
                </Badge>
              </div>
              
              <div className="flex items-baseline justify-center gap-1">
                <span className={`text-3xl font-bold ${
                  tier.id === 'free' ? 'text-blue-400' :
                  tier.id === 'professional' ? 'text-green-400' :
                  'text-red-400'
                }`}>{tier.price}</span>
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
                    ? `${
                        tier.id === 'free' ? 'bg-blue-500 hover:bg-blue-600 text-white' :
                        tier.id === 'professional' ? 'bg-green-500 hover:bg-green-600 text-white' :
                        'bg-red-500 hover:bg-red-600 text-white'
                      }`
                    : `border-2 ${
                        tier.id === 'free' ? 'border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white' :
                        tier.id === 'professional' ? 'border-green-500 text-green-400 hover:bg-green-500 hover:text-white' :
                        'border-red-500 text-red-400 hover:bg-red-500 hover:text-white'
                      }`
                  }
                `}
                onClick={() => onTierSelect?.(tier.id)}
              >
                {tier.buttonText}
              </Button>
            </CardFooter>
          </Card>
            </motion.div>
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
import { useState } from 'react';
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Music, Music2, Music3, Music4, DollarSign, Lock } from "lucide-react";

interface Genre {
  id: string;
  name: string;
  price: number;
  icon: React.ReactNode;
  description: string;
  isFree?: boolean;
}

interface GenreSelectionProps {
  selectedTier: string;
  onGenreSelect: (genreId: string, price: number) => void;
  selectedGenre?: string;
}

export function GenreSelection({ selectedTier, onGenreSelect, selectedGenre }: GenreSelectionProps) {
  const [showPayment, setShowPayment] = useState(false);
  const [pendingGenre, setPendingGenre] = useState<Genre | null>(null);

  // Define genres based on tier
  const getGenresForTier = (tier: string): Genre[] => {
    const baseGenres: Genre[] = [
      {
        id: 'pop',
        name: 'Pop',
        price: tier === 'professional' ? 0 : 1,
        icon: <Music className="w-5 h-5" />,
        description: 'Modern pop with balanced dynamics',
        isFree: tier === 'professional'
      },
      {
        id: 'rock',
        name: 'Rock',
        price: tier === 'professional' ? 0 : 1,
        icon: <Music2 className="w-5 h-5" />,
        description: 'Powerful rock with punch and clarity',
        isFree: tier === 'professional'
      },
      {
        id: 'reggae',
        name: 'Reggae',
        price: tier === 'professional' ? 0 : 1,
        icon: <Music3 className="w-5 h-5" />,
        description: 'Rhythmic reggae with deep bass',
        isFree: tier === 'professional'
      },
      {
        id: 'electronic',
        name: 'Electronic',
        price: 1,
        icon: <Music4 className="w-5 h-5" />,
        description: 'Electronic music with crisp highs'
      },
      {
        id: 'jazz',
        name: 'Jazz',
        price: tier === 'advanced' ? 0 : 1,
        icon: <Music className="w-5 h-5" />,
        description: 'Smooth jazz with natural dynamics',
        isFree: tier === 'advanced'
      },
      {
        id: 'classical',
        name: 'Classical',
        price: 1,
        icon: <Music2 className="w-5 h-5" />,
        description: 'Classical with wide dynamic range'
      },
      {
        id: 'hiphop',
        name: 'Hip-Hop',
        price: 1,
        icon: <Music3 className="w-5 h-5" />,
        description: 'Hip-hop with powerful low end'
      },
      {
        id: 'country',
        name: 'Country',
        price: 1,
        icon: <Music4 className="w-5 h-5" />,
        description: 'Country with vocal clarity'
      },
      {
        id: 'folk',
        name: 'Folk',
        price: 1,
        icon: <Music className="w-5 h-5" />,
        description: 'Acoustic folk with warmth'
      },
      {
        id: 'afrobeats',
        name: 'Afrobeats',
        price: tier === 'advanced' ? 0 : 1,
        icon: <Music2 className="w-5 h-5" />,
        description: 'Afrobeats with rhythmic emphasis',
        isFree: tier === 'advanced'
      },
      {
        id: 'gospel',
        name: 'Gospel',
        price: tier === 'advanced' ? 0 : 1,
        icon: <Music3 className="w-5 h-5" />,
        description: 'Gospel with vocal prominence',
        isFree: tier === 'advanced'
      },
      {
        id: 'rnb',
        name: 'R&B',
        price: 1,
        icon: <Music4 className="w-5 h-5" />,
        description: 'R&B with smooth vocals'
      }
    ];

    if (tier === 'advanced') {
      return baseGenres.map(genre => ({ ...genre, price: 0, isFree: true }));
    }

    return baseGenres;
  };

  const genres = getGenresForTier(selectedTier);

  const handleGenreClick = (genre: Genre) => {
    if (genre.price === 0 || genre.isFree) {
      onGenreSelect(genre.id, genre.price);
    } else {
      setPendingGenre(genre);
      setShowPayment(true);
    }
  };

  const handlePayment = () => {
    if (pendingGenre) {
      onGenreSelect(pendingGenre.id, pendingGenre.price);
      setShowPayment(false);
      setPendingGenre(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-crys-white text-xl mb-2">Select Genre</h3>
        <p className="text-crys-light-grey text-sm">
          Choose the genre that best matches your track for optimized processing
        </p>
        {selectedTier !== 'advanced' && (
          <Badge variant="secondary" className="mt-2 bg-crys-gold/20 text-crys-gold">
            Some genres require additional payment
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {genres.map((genre) => (
          <Card
            key={genre.id}
            className={`
              cursor-pointer transition-all duration-200 border-2
              ${selectedGenre === genre.id
                ? 'border-crys-gold bg-crys-gold/10'
                : 'border-crys-graphite hover:border-crys-gold/50'
              }
              bg-audio-panel-bg
            `}
            onClick={() => handleGenreClick(genre)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 bg-crys-gold/20 rounded-lg flex items-center justify-center text-crys-gold">
                  {genre.icon}
                </div>
                <div className="flex items-center gap-1">
                  {genre.isFree || genre.price === 0 ? (
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400 text-xs">
                      Free
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-crys-gold/20 text-crys-gold text-xs">
                      ${genre.price}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <h4 className="text-crys-white font-medium mb-1">{genre.name}</h4>
              <p className="text-crys-light-grey text-xs">{genre.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="bg-audio-panel-bg border-audio-panel-border">
          <DialogHeader>
            <DialogTitle className="text-crys-white">Genre Payment Required</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {pendingGenre && (
              <div className="flex items-center gap-4 p-4 bg-crys-graphite/30 rounded-lg">
                <div className="w-12 h-12 bg-crys-gold/20 rounded-lg flex items-center justify-center text-crys-gold">
                  {pendingGenre.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-crys-white">{pendingGenre.name}</h3>
                  <p className="text-crys-light-grey text-sm">{pendingGenre.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-crys-gold text-lg font-medium">${pendingGenre.price}</div>
                  <div className="text-crys-light-grey text-xs">One-time fee</div>
                </div>
              </div>
            )}
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPayment(false)}
                className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePayment}
                className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black flex-1"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Pay ${pendingGenre?.price}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {selectedGenre && (
        <div className="text-center">
          <Badge variant="secondary" className="bg-crys-gold/20 text-crys-gold">
            Selected: {genres.find(g => g.id === selectedGenre)?.name}
          </Badge>
        </div>
      )}
    </div>
  );
}
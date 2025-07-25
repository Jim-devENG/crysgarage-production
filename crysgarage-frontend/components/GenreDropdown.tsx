import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export interface Genre {
  id: string;
  name: string;
  description: string;
  price: number;
  characteristics: string[];
}

const availableGenres: Genre[] = [
  {
    id: 'afrobeats',
    name: 'Afrobeats',
    description: 'Modern African pop with heavy bass and percussion',
    price: 0,
    characteristics: ['Heavy bass', 'Percussion focus', 'Modern pop elements']
  },
  {
    id: 'gospel',
    name: 'Gospel',
    description: 'Spiritual music with rich harmonies and dynamic range',
    price: 0,
    characteristics: ['Rich harmonies', 'Dynamic range', 'Spiritual focus']
  },
  {
    id: 'hip-hop',
    name: 'Hip-Hop',
    description: 'Urban music with strong beats and vocal clarity',
    price: 0,
    characteristics: ['Strong beats', 'Vocal clarity', 'Urban sound']
  },
  {
    id: 'highlife',
    name: 'Highlife',
    description: 'Traditional African music with brass and guitar',
    price: 0,
    characteristics: ['Brass instruments', 'Guitar focus', 'Traditional elements']
  },
  {
    id: 'amapiano',
    name: 'Amapiano',
    description: 'South African house with piano melodies',
    price: 0,
    characteristics: ['Piano melodies', 'House elements', 'South African style']
  },
  {
    id: 'reggae',
    name: 'Reggae',
    description: 'Jamaican music with offbeat rhythm and bass',
    price: 0,
    characteristics: ['Offbeat rhythm', 'Bass focus', 'Jamaican style']
  },
  {
    id: 'soul',
    name: 'Soul',
    description: 'Emotional music with warm vocals and groove',
    price: 0,
    characteristics: ['Warm vocals', 'Groove focus', 'Emotional depth']
  },
  {
    id: 'jazz',
    name: 'Jazz',
    description: 'Complex harmonies with improvisation and swing',
    price: 0,
    characteristics: ['Complex harmonies', 'Improvisation', 'Swing rhythm']
  }
];

interface GenreDropdownProps {
  selectedGenre: string;
  onGenreSelect: (genreId: string, price: number) => void;
  disabled?: boolean;
}

export const GenreDropdown: React.FC<GenreDropdownProps> = ({
  selectedGenre,
  onGenreSelect,
  disabled = false
}) => {
  const handleGenreChange = (genreId: string) => {
    const genre = availableGenres.find(g => g.id === genreId);
    if (genre) {
      onGenreSelect(genreId, genre.price);
    }
  };

  const selectedGenreData = availableGenres.find(g => g.id === selectedGenre);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-crys-white mb-2">
          Select Genre
        </label>
        <Select
          value={selectedGenre}
          onValueChange={handleGenreChange}
          disabled={disabled}
        >
          <SelectTrigger className="w-full bg-crys-charcoal border-crys-graphite text-crys-white">
            <SelectValue placeholder="Choose a genre for your track" />
          </SelectTrigger>
          <SelectContent className="bg-crys-charcoal border-crys-graphite">
            {availableGenres.map((genre) => (
              <SelectItem
                key={genre.id}
                value={genre.id}
                className="text-crys-white hover:bg-crys-graphite focus:bg-crys-graphite"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{genre.name}</span>
                  <span className="text-sm text-crys-light-grey">{genre.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedGenreData && (
        <div className="bg-crys-graphite/20 rounded-lg p-4">
          <h4 className="text-crys-gold font-medium mb-2">{selectedGenreData.name}</h4>
          <p className="text-crys-light-grey text-sm mb-3">{selectedGenreData.description}</p>
          <div className="space-y-1">
            <h5 className="text-crys-white text-xs font-medium">Characteristics:</h5>
            <ul className="text-xs text-crys-light-grey space-y-1">
              {selectedGenreData.characteristics.map((char, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-1 h-1 bg-crys-gold rounded-full mr-2"></span>
                  {char}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}; 
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export interface Genre {
  id: string;
  name: string;
  description: string;
  price: number;
  characteristics: string[];
}

export const availableGenres: Genre[] = [
  // RED - High Energy, Bass Heavy
  {
    id: 'afrobeats',
    name: 'Afrobeats',
    description: 'Modern African pop with heavy bass and percussion',
    price: 0,
    characteristics: ['Heavy bass', 'Percussion focus', 'Modern pop elements']
  },
  {
    id: 'trap',
    name: 'Trap',
    description: 'High-energy hip-hop with heavy 808s and hi-hats',
    price: 0,
    characteristics: ['808 bass', 'Hi-hat rolls', 'Dark atmosphere']
  },
  {
    id: 'drill',
    name: 'Drill',
    description: 'UK/NY/Africa drill with aggressive beats and flows',
    price: 0,
    characteristics: ['Aggressive beats', 'Dark melodies', 'Hard-hitting']
  },
  {
    id: 'dubstep',
    name: 'Dubstep',
    description: 'Electronic music with heavy bass drops and wobbles',
    price: 0,
    characteristics: ['Bass drops', 'Wobble bass', 'Electronic elements']
  },
  
  // BLUE - Smooth, Melodic
  {
    id: 'gospel',
    name: 'Gospel',
    description: 'Spiritual music with rich harmonies and dynamic range',
    price: 0,
    characteristics: ['Rich harmonies', 'Dynamic range', 'Spiritual focus']
  },
  {
    id: 'r-b',
    name: 'R&B',
    description: 'Smooth soulful music with emotional vocals',
    price: 0,
    characteristics: ['Smooth vocals', 'Emotional depth', 'Soulful melodies']
  },
  {
    id: 'lofi-hiphop',
    name: 'Lo-Fi Hip-Hop',
    description: 'Chill instrumental hip-hop with relaxed vibes',
    price: 0,
    characteristics: ['Chill vibes', 'Lo-fi aesthetic', 'Relaxed tempo']
  },
  
  // ORANGE - Energetic, Dynamic
  {
    id: 'hip-hop',
    name: 'Hip-Hop',
    description: 'Urban music with strong beats and vocal clarity',
    price: 0,
    characteristics: ['Strong beats', 'Vocal clarity', 'Urban sound']
  },
  {
    id: 'house',
    name: 'House',
    description: 'Electronic dance music with four-on-the-floor beats',
    price: 0,
    characteristics: ['Four-on-floor', 'Electronic beats', 'Dance energy']
  },
  {
    id: 'techno',
    name: 'Techno',
    description: 'Industrial electronic music with driving rhythms',
    price: 0,
    characteristics: ['Industrial sounds', 'Driving rhythms', 'Electronic']
  },
  {
    id: 'crys-garage',
    name: 'Crys Garage',
    description: 'Premium blend of Hip-Hop, R&B & Amapiano with enhanced bass and clarity',
    price: 0,
    characteristics: ['Enhanced bass', 'Vocal clarity', 'Premium mastering', 'Hip-Hop energy', 'R&B smoothness', 'Amapiano groove']
  },
  
  // GREEN - Natural, Organic
  {
    id: 'highlife',
    name: 'Highlife',
    description: 'Traditional African music with brass and guitar',
    price: 0,
    characteristics: ['Brass instruments', 'Guitar focus', 'Traditional elements']
  },
  {
    id: 'instrumentals',
    name: 'Instrumentals',
    description: 'Pure instrumental music without vocals',
    price: 0,
    characteristics: ['No vocals', 'Musical focus', 'Melodic instruments']
  },
  {
    id: 'beats',
    name: 'Beats',
    description: 'Production beats for rappers and vocalists',
    price: 0,
    characteristics: ['Beat focus', 'Vocal ready', 'Production quality']
  },
  
  // PURPLE - Creative, Artistic
  {
    id: 'amapiano',
    name: 'Amapiano',
    description: 'South African house with piano melodies',
    price: 0,
    characteristics: ['Piano melodies', 'House elements', 'South African style']
  },
  {
    id: 'trance',
    name: 'Trance',
    description: 'Uplifting electronic music with melodic leads',
    price: 0,
    characteristics: ['Melodic leads', 'Uplifting energy', 'Electronic']
  },
  {
    id: 'drum-bass',
    name: 'Modern Pop Special',
    description: 'Fast-paced electronic music with breakbeats',
    price: 0,
    characteristics: ['Fast tempo', 'Breakbeats', 'High energy']
  },
  
  // YELLOW - Bright, Clear
  {
    id: 'reggae',
    name: 'Reggae',
    description: 'Jamaican music with offbeat rhythm and bass',
    price: 0,
    characteristics: ['Offbeat rhythm', 'Bass focus', 'Jamaican style']
  },
  {
    id: 'voice-over',
    name: 'Voice Over',
    description: 'Professional voice recordings for media',
    price: 0,
    characteristics: ['Clear vocals', 'Professional quality', 'Media ready']
  },
  {
    id: 'journalist',
    name: 'Journalist',
    description: 'News and documentary voice recordings',
    price: 0,
    characteristics: ['Clear speech', 'Professional tone', 'News quality']
  },
  
  // PINK - Warm, Emotional
  {
    id: 'soul',
    name: 'Soul',
    description: 'Emotional music with warm vocals and groove',
    price: 0,
    characteristics: ['Warm vocals', 'Groove focus', 'Emotional depth']
  },
  {
    id: 'content-creator',
    name: 'Content Creator',
    description: 'Audio optimized for social media and content',
    price: 0,
    characteristics: ['Social media ready', 'Engaging audio', 'Content optimized']
  },
  {
    id: 'pop',
    name: 'Pop',
    description: 'Mainstream popular music with catchy melodies',
    price: 0,
    characteristics: ['Catchy melodies', 'Clean production', 'Radio-friendly']
  },
  
  // INDIGO - Sophisticated, Complex
  {
    id: 'jazz',
    name: 'Jazz',
    description: 'Complex harmonies with improvisation and swing',
    price: 0,
    characteristics: ['Complex harmonies', 'Improvisation', 'Swing rhythm']
  }
  ,
  // Additional genres aligned to Python preset keys (IDs match preset names)
  { id: 'Naija Pop', name: 'Naija Pop', description: 'Modern Nigerian pop sheen', price: 0, characteristics: ['Pop sheen', 'Balanced low-end'] },
  { id: 'Bongo Flava', name: 'Bongo Flava', description: 'East African pop with silky highs', price: 0, characteristics: ['Silky highs', 'Smooth vocals'] },
  { id: 'Kwaito', name: 'Kwaito', description: 'South African groove with emphasized bassline', price: 0, characteristics: ['Groove', 'Bassline focus'] },
  { id: 'Gqom', name: 'Gqom', description: 'Deep subs and driving rhythms', price: 0, characteristics: ['Deep subs', 'Driving rhythms'] },
  { id: 'Shangaan Electro', name: 'Shangaan Electro', description: 'Fast, bright, and percussive electro', price: 0, characteristics: ['Fast tempo', 'Bright highs'] },
  { id: 'Kwela', name: 'Kwela', description: 'Pennywhistle-forward with mid presence', price: 0, characteristics: ['Pennywhistle', 'Mid presence'] },
  { id: 'Kuduro', name: 'Kuduro', description: 'Club energy with crisp highs', price: 0, characteristics: ['Club energy', 'Crisp highs'] },
  { id: 'Ndombolo', name: 'Ndombolo', description: 'Dance rhythms with natural tonality', price: 0, characteristics: ['Dance rhythms', 'Natural tone'] },
  { id: 'Pop', name: 'Pop', description: 'Balanced lows and airy highs', price: 0, characteristics: ['Balanced', 'Airy highs'] },
  { id: 'Hip Hop', name: 'Hip Hop', description: 'Deep bass and vocal clarity', price: 0, characteristics: ['Deep bass', 'Vocal clarity'] },
  { id: 'R&B', name: 'R&B', description: 'Warm lows and smooth highs', price: 0, characteristics: ['Warm lows', 'Smooth highs'] },
  { id: 'Rock', name: 'Rock', description: 'Guitar and mid presence', price: 0, characteristics: ['Guitar presence', 'Mid emphasis'] },
  { id: 'Electronic', name: 'Electronic', description: 'Sub bass and bright highs', price: 0, characteristics: ['Sub bass', 'Bright highs'] },
  { id: 'Classical', name: 'Classical', description: 'Neutral and natural tonality', price: 0, characteristics: ['Neutral', 'Natural'] },
  { id: 'Reggae', name: 'Reggae', description: 'Warm bass and natural highs', price: 0, characteristics: ['Warm bass', 'Natural highs'] },
  { id: 'Country', name: 'Country', description: 'Vocal and guitar presence', price: 0, characteristics: ['Vocal presence', 'Guitar presence'] },
  { id: 'Blues', name: 'Blues', description: 'Warm lows and guitar presence', price: 0, characteristics: ['Warm lows', 'Guitar presence'] },
  { id: 'Highlife', name: 'Highlife', description: 'Warm bass and guitar clarity', price: 0, characteristics: ['Guitar clarity', 'Warm bass'] },
  { id: 'Instrumentals', name: 'Instrumentals', description: 'Instrument presence and clarity', price: 0, characteristics: ['Instrument focus', 'Clarity'] },
  { id: 'Beats', name: 'Beats', description: 'Beat punch and clarity', price: 0, characteristics: ['Punch', 'Clarity'] },
  { id: 'Trance', name: 'Trance', description: 'Bright leads and trance bass', price: 0, characteristics: ['Bright leads', 'Trance bass'] },
  { id: 'Drum & Bass', name: 'Drum & Bass', description: 'Massive bass and clarity', price: 0, characteristics: ['Massive bass', 'Clarity'] },
  { id: 'Voice Over', name: 'Voice Over', description: 'Clear, professional narration', price: 0, characteristics: ['Clear voice', 'Broadcast ready'] },
  { id: 'Journalist', name: 'Journalist', description: 'News/documentary voice', price: 0, characteristics: ['Speech clarity', 'Professional tone'] },
  { id: 'Soul', name: 'Soul', description: 'Warm vocals and clarity', price: 0, characteristics: ['Warm vocals', 'Clarity'] },
  { id: 'Content Creator', name: 'Content Creator', description: 'Engaging, platform-ready audio', price: 0, characteristics: ['Engaging', 'Platform-ready'] },
  { id: 'CrysGarage', name: 'CrysGarage', description: 'Signature bass and clarity', price: 0, characteristics: ['Signature bass', 'Clarity'] },
  { id: 'Shrap', name: 'Shrap', description: 'Heavy bass and punch', price: 0, characteristics: ['Heavy bass', 'Punch'] },
  { id: 'Singeli', name: 'Singeli', description: 'Fast tempo and bright highs', price: 0, characteristics: ['Fast tempo', 'Bright highs'] },
  { id: 'Urban Benga', name: 'Urban Benga', description: 'Vocal warmth and guitar presence', price: 0, characteristics: ['Vocal warmth', 'Guitar presence'] },
  { id: 'New Benga', name: 'New Benga', description: 'Warm bass and vocal presence', price: 0, characteristics: ['Warm bass', 'Vocal presence'] },
  { id: "Raï N'B", name: "Raï N'B", description: 'Warm lows and vocal clarity', price: 0, characteristics: ['Warm lows', 'Vocal clarity'] },
  { id: 'Raï-hop', name: 'Raï-hop', description: 'Deep bass and sharp highs', price: 0, characteristics: ['Deep bass', 'Sharp highs'] },
  { id: 'Gnawa Fusion', name: 'Gnawa Fusion', description: 'Guitar presence and warmth', price: 0, characteristics: ['Guitar presence', 'Warmth'] },
  { id: 'Afrotrap', name: 'Afrotrap', description: 'Heavy bass and clarity', price: 0, characteristics: ['Heavy bass', 'Clarity'] },
  { id: 'Afro-Gospel', name: 'Afro-Gospel', description: 'Vocal warmth and clarity', price: 0, characteristics: ['Vocal warmth', 'Clarity'] },
  { id: 'Urban Gospel', name: 'Urban Gospel', description: 'Voice presence and brightness', price: 0, characteristics: ['Voice presence', 'Brightness'] },
  { id: 'Alté', name: 'Alté', description: 'Alternative airy highs', price: 0, characteristics: ['Airy highs', 'Soft mids'] },
  { id: 'Azonto', name: 'Azonto', description: 'Dance punch and bright highs', price: 0, characteristics: ['Dance punch', 'Bright highs'] },
  { id: 'Hip-life', name: 'Hip-life', description: 'Kick punch and vocal clarity', price: 0, characteristics: ['Kick punch', 'Vocal clarity'] }
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
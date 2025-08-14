import React, { useState } from 'react';
import { Music, Music2, Music3, Music4, Palette } from 'lucide-react';
import { GENRE_PRESETS, getGenreGradient } from './sharedGenrePresets';

interface GenrePresetsProps {
  selectedGenre: string;
  onGenreSelect: (genreId: string) => void;
}

const availableGenres = [
  { id: 'afrobeats', name: 'Afrobeats', icon: Music, gradient: 'from-orange-500 to-red-500' },
  { id: 'amapiano', name: 'Amapiano', icon: Music2, gradient: 'from-purple-500 to-pink-500' },
  { id: 'hiphop', name: 'Hip Hop', icon: Music3, gradient: 'from-blue-500 to-purple-500' },
  { id: 'rnb', name: 'R&B', icon: Music4, gradient: 'from-pink-500 to-red-500' },
  { id: 'pop', name: 'Pop', icon: Music, gradient: 'from-yellow-500 to-orange-500' },
  { id: 'electronic', name: 'Electronic', icon: Music2, gradient: 'from-cyan-500 to-blue-500' },
  { id: 'rock', name: 'Rock', icon: Music3, gradient: 'from-red-500 to-orange-500' },
  { id: 'jazz', name: 'Jazz', icon: Music4, gradient: 'from-green-500 to-blue-500' },
  { id: 'classical', name: 'Classical', icon: Music, gradient: 'from-gray-500 to-blue-500' },
  { id: 'country', name: 'Country', icon: Music2, gradient: 'from-green-500 to-yellow-500' },
  { id: 'reggae', name: 'Reggae', icon: Music3, gradient: 'from-green-500 to-red-500' },
  { id: 'blues', name: 'Blues', icon: Music4, gradient: 'from-blue-500 to-purple-500' },
  { id: 'folk', name: 'Folk', icon: Music, gradient: 'from-brown-500 to-green-500' },
  { id: 'gospel', name: 'Gospel', icon: Music2, gradient: 'from-purple-500 to-blue-500' },
  { id: 'latin', name: 'Latin', icon: Music3, gradient: 'from-red-500 to-yellow-500' },
  { id: 'world', name: 'World', icon: Music4, gradient: 'from-rainbow-500 to-multicolor-500' }
];

const GenrePresets: React.FC<GenrePresetsProps> = ({ selectedGenre, onGenreSelect }) => {
  const [activeTab, setActiveTab] = useState<'popular' | 'all'>('popular');

  const popularGenres = availableGenres.slice(0, 8);
  const allGenres = availableGenres;

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-4 border border-gray-600">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-r from-crys-gold to-yellow-500 p-1.5 rounded-md">
            <Palette className="w-4 h-4 text-gray-900" />
          </div>
          <h3 className="text-lg font-bold text-white">Genre Presets</h3>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-900 rounded-md p-1">
          <button
            onClick={() => setActiveTab('popular')}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              activeTab === 'popular'
                ? 'bg-crys-gold text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Popular
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-crys-gold text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All Genres
          </button>
        </div>
      </div>

      {/* Genre Grid */}
      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-1.5">
        {(activeTab === 'popular' ? popularGenres : allGenres).map((genre) => {
          const IconComponent = genre.icon;
          const isSelected = selectedGenre === genre.id;
          
          return (
            <button
              key={genre.id}
              onClick={() => onGenreSelect(genre.id)}
              className={`relative group p-2 rounded-md border transition-all duration-200 bg-gradient-to-br ${getGenreGradient(genre.id)} ${
                isSelected
                  ? 'border-crys-gold shadow-sm'
                  : 'border-white/20 hover:border-white/40'
              }`}
            >
              {/* Overlay */}
              <div className={`absolute inset-0 bg-black/20 rounded-md`} />
              
              {/* Content */}
              <div className="relative z-10 flex flex-col items-center space-y-1">
                <div className={`p-1.5 rounded-md ${
                  isSelected 
                    ? 'bg-crys-gold text-gray-900' 
                    : 'bg-gray-700 text-gray-300 group-hover:text-white'
                }`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <span className={`text-[10px] font-medium text-center ${
                  isSelected ? 'text-crys-gold' : 'text-white'
                }`}>
                  {genre.name}
                </span>
                {GENRE_PRESETS[genre.id] && (
                  <span className="text-[8px] text-white/90">
                    LUFS {GENRE_PRESETS[genre.id].targetLufs} • TP {GENRE_PRESETS[genre.id].truePeak}
                  </span>
                )}
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-crys-gold rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-gray-900 rounded-full"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Genre Info */}
      {selectedGenre && (
        <div className="mt-3 p-2 bg-gray-900 rounded-md border border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {(() => {
                const genre = availableGenres.find(g => g.id === selectedGenre);
                if (!genre) return null;
                const IconComponent = genre.icon;
                return (
                  <>
                    <div className={`p-1.5 rounded-md bg-gradient-to-br ${getGenreGradient(genre.id)}`}>
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-xs">{genre.name} Preset</h4>
                      <p className="text-[10px] text-gray-400">Target LUFS {GENRE_PRESETS[genre.id]?.targetLufs} | True Peak {GENRE_PRESETS[genre.id]?.truePeak}</p>
                    </div>
                  </>
                );
              })()}
            </div>
            <button
              onClick={() => onGenreSelect('')}
              className="text-gray-400 hover:text-white text-[10px]"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenrePresets;

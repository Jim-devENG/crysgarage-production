import React, { useState } from 'react';
import { Music, Music2, Music3, Music4, Palette } from 'lucide-react';
import { availableGenres, Genre as GenreType } from '../GenreDropdown';
import { GENRE_PRESETS, getGenreGradient } from './sharedGenrePresets';

interface GenrePresetsProps {
  selectedGenre: string;
  onGenreSelect: (genreId: string) => void;
}

const GenrePresets: React.FC<GenrePresetsProps> = ({ selectedGenre, onGenreSelect }) => {
  const [activeTab, setActiveTab] = useState<'popular' | 'all'>('popular');

  // Popular genres (first 12)
  const popularGenres = availableGenres.slice(0, 12);
  const allGenres = availableGenres;

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-4 border border-gray-600">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <div className="bg-gradient-to-r from-crys-gold to-yellow-500 p-1.5 rounded-md">
            <Palette className="w-4 h-4 text-gray-900" />
          </div>
          <h3 className="text-xl font-bold text-white">Select Genre & Process</h3>
        </div>
        <p className="text-gray-400 text-sm">Click a genre to apply its preset and process your audio</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-6">
        <div className="flex space-x-1 bg-gray-900 rounded-md p-1">
          <button
            onClick={() => setActiveTab('popular')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              activeTab === 'popular'
                ? 'bg-crys-gold text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Popular Genres
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-crys-gold text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All Genres
          </button>
        </div>
      </div>

      {/* Genre Grid - Matching Professional Tier Design */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-6">
        {(activeTab === 'popular' ? popularGenres : allGenres).map((genre) => {
          const isSelected = selectedGenre === genre.id;
          
          return (
            <button
              key={genre.id}
              onClick={() => onGenreSelect(genre.id)}
              className={`px-4 py-3 rounded-lg border-2 transition-all duration-300 text-center hover:scale-105 bg-gradient-to-br ${getGenreGradient(genre.id)} ${
                isSelected
                  ? 'border-crys-gold shadow-lg shadow-crys-gold/30 scale-105'
                  : 'border-white/20 hover:border-white/40 hover:scale-110'
              } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
            >
              <h3 className="font-semibold text-sm mb-1 text-white drop-shadow-sm">{genre.name}</h3>
              <p className="text-xs text-white/80 leading-tight drop-shadow-sm">{genre.description}</p>
              
              {/* Genre Preset Info */}
              {GENRE_PRESETS[genre.id] && (
                <div className="mt-2 pt-2 border-t border-white/20">
                  <div className="text-[10px] text-white/90">
                    <div className="flex justify-between">
                      <span>LUFS:</span>
                      <span className="font-medium">{GENRE_PRESETS[genre.id].targetLufs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Peak:</span>
                      <span className="font-medium">{GENRE_PRESETS[genre.id].truePeak}</span>
                    </div>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Genre Info */}
      {selectedGenre && (
        <div className="mt-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {(() => {
                const genre = availableGenres.find(g => g.id === selectedGenre);
                if (!genre) return null;
                return (
                  <>
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${getGenreGradient(genre.id)}`}>
                      <Music className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-sm">{genre.name} Preset</h4>
                      <p className="text-xs text-gray-400">{genre.description}</p>
                      {GENRE_PRESETS[genre.id] && (
                        <p className="text-[10px] text-gray-500 mt-1">
                          Target LUFS {GENRE_PRESETS[genre.id].targetLufs} | True Peak {GENRE_PRESETS[genre.id].truePeak}
                        </p>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
            <button
              onClick={() => onGenreSelect('')}
              className="text-gray-400 hover:text-white text-sm px-3 py-1 rounded border border-gray-600 hover:border-gray-500 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Genre Characteristics Info */}
      <div className="mt-4 p-3 bg-gray-900/50 rounded-lg border border-gray-600">
        <h5 className="text-sm font-medium text-white mb-2">7-Color Genre System</h5>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-400">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Red - High Energy</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Blue - Smooth</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span>Orange - Dynamic</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Green - Natural</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span>Purple - Creative</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Yellow - Bright</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-pink-500 rounded"></div>
            <span>Pink - Warm</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-indigo-500 rounded"></div>
            <span>Indigo - Sophisticated</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenrePresets;

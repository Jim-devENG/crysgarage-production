import React, { useState } from 'react';
import { Music, Music2, Music3, Music4, Palette, Lock, Unlock } from 'lucide-react';
import { availableGenres, Genre as GenreType } from '../GenreDropdown';
import { GENRE_PRESETS, getGenreGradient } from './sharedGenrePresets';

interface GenrePresetsProps {
  selectedGenre: string;
  onGenreSelect: (genreId: string) => void;
  genreLocked?: boolean;
  onToggleGenreLock?: () => void;
}

const GenrePresets: React.FC<GenrePresetsProps> = ({ 
  selectedGenre, 
  onGenreSelect, 
  genreLocked = false, 
  onToggleGenreLock 
}) => {
  const [activeTab, setActiveTab] = useState<'popular' | 'all'>('popular');

  // Popular genres (first 12)
  const popularGenres = availableGenres.slice(0, 12);
  const allGenres = availableGenres;

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-3 border border-gray-600">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center space-x-2 mb-1.5">
          <div className="bg-gradient-to-r from-crys-gold to-yellow-500 p-1 rounded-md">
            <Palette className="w-3 h-3 text-gray-900" />
          </div>
          <h3 className="text-lg font-bold text-white">Select Genre & Process</h3>
        </div>
        <p className="text-gray-400 text-xs">Click a genre to apply its preset and process your audio</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-4">
        <div className="flex space-x-1 bg-gray-900 rounded-md p-1">
          <button
            onClick={() => setActiveTab('popular')}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              activeTab === 'popular'
                ? 'bg-crys-gold text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Popular Genres
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

      {/* Genre Grid - Matching Professional Tier Design */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 mb-6">
        {(activeTab === 'popular' ? popularGenres : allGenres).map((genre) => {
          const isSelected = selectedGenre === genre.id;
          
          return (
            <button
              key={genre.id}
              onClick={() => onGenreSelect(genre.id)}
              className={`px-2 py-2 rounded-md border transition-all duration-300 text-center hover:scale-105 bg-gradient-to-br ${getGenreGradient(genre.id)} ${
                isSelected
                  ? 'border-crys-gold shadow-md shadow-crys-gold/30 scale-105'
                  : 'border-white/20 hover:border-white/40 hover:scale-110'
              } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
            >
              <h3 className="font-semibold text-xs mb-1 text-white drop-shadow-sm">{genre.name}</h3>
              <p className="text-[10px] text-white/80 leading-tight drop-shadow-sm line-clamp-2">{genre.description}</p>
              
              {/* Genre Preset Info */}
              {GENRE_PRESETS[genre.id] && (
                <div className="mt-1 pt-1 border-t border-white/20">
                  <div className="text-[8px] text-white/90">
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
        <div className="mt-3 p-3 bg-gray-900 rounded-md border border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {(() => {
                const genre = availableGenres.find(g => g.id === selectedGenre);
                if (!genre) return null;
                return (
                  <>
                    <div className={`p-1.5 rounded-md bg-gradient-to-br ${getGenreGradient(genre.id)}`}>
                      <Music className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-xs">{genre.name} Preset</h4>
                      <p className="text-[10px] text-gray-400">{genre.description}</p>
                      {GENRE_PRESETS[genre.id] && (
                        <p className="text-[8px] text-gray-500 mt-0.5">
                          Target LUFS {GENRE_PRESETS[genre.id].targetLufs} | True Peak {GENRE_PRESETS[genre.id].truePeak}
                        </p>
                      )}
                      {genreLocked && (
                        <div className="flex items-center space-x-1 mt-1">
                          <Lock className="w-2 h-2 text-crys-gold" />
                          <span className="text-[8px] text-crys-gold font-medium">Genre Locked</span>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="flex items-center space-x-2">
              {/* Genre Lock Button */}
              {onToggleGenreLock && (
                <button
                  onClick={onToggleGenreLock}
                  className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${
                    genreLocked
                      ? 'bg-crys-gold text-black hover:bg-yellow-400'
                      : 'text-gray-400 hover:text-white border border-gray-600 hover:border-gray-500'
                  }`}
                  title={genreLocked ? 'Unlock Genre Preset' : 'Lock Genre Preset'}
                >
                  {genreLocked ? (
                    <>
                      <Lock className="w-3 h-3" />
                      <span>Locked</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3 h-3" />
                      <span>Lock</span>
                    </>
                  )}
                </button>
              )}
              <button
                onClick={() => onGenreSelect('')}
                className="text-gray-400 hover:text-white text-xs px-2 py-1 rounded border border-gray-600 hover:border-gray-500 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Genre Characteristics Info */}
      <div className="mt-3 p-2 bg-gray-900/50 rounded-md border border-gray-600">
        <h5 className="text-xs font-medium text-white mb-1.5">7-Color Genre System</h5>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 text-[10px] text-gray-400">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded"></div>
            <span>Red - High Energy</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded"></div>
            <span>Blue - Smooth</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-orange-500 rounded"></div>
            <span>Orange - Dynamic</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded"></div>
            <span>Green - Natural</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-purple-500 rounded"></div>
            <span>Purple - Creative</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-yellow-500 rounded"></div>
            <span>Yellow - Bright</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-pink-500 rounded"></div>
            <span>Pink - Warm</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-indigo-500 rounded"></div>
            <span>Indigo - Sophisticated</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenrePresets;

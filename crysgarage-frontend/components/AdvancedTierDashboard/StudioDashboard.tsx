import React, { useState } from 'react';
import StudioRack from './StudioRack';
import BasicEffects from './effects/BasicEffects';
import PremiumEffects from './effects/PremiumEffects';

interface StudioDashboardProps {
  audioEffects: any;
  onUpdateEffectSettings: (effectType: string, settings: any) => void;
  onTogglePremiumEffect: (effectType: string, enabled: boolean) => void;
  onToggleEffect: (effectType: string, enabled: boolean) => void;
  selectedGenre: string;
  onGenreSelect: (genreId: string) => void;
  meterData: any;
  onSaveSettings?: () => void;
  onLoadSettings?: () => void;
  onManualInit?: () => void;
}

const StudioDashboard: React.FC<StudioDashboardProps> = ({
  audioEffects,
  onUpdateEffectSettings,
  onTogglePremiumEffect,
  onToggleEffect,
  selectedGenre,
  onGenreSelect,
  meterData,
  onSaveSettings,
  onLoadSettings,
  onManualInit
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'premium'>('basic');

  return (
    <div className="backdrop-blur-md bg-black bg-opacity-30 rounded-lg p-3 border border-gray-500 border-opacity-50 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-r from-crys-gold to-yellow-500 p-1 rounded-md">
            <div className="w-3 h-3 bg-gray-900 rounded"></div>
          </div>
          <h3 className="text-base font-bold text-white">Studio Dashboard</h3>
        </div>
        
        <div className="flex space-x-2">
          {onSaveSettings && (
            <button
              onClick={onSaveSettings}
              className="bg-crys-gold text-black px-2 py-1 rounded-md text-xs font-medium hover:bg-yellow-400 transition-colors"
            >
              Save Settings
            </button>
          )}
          {onLoadSettings && (
            <button
              onClick={onLoadSettings}
              className="bg-gray-600 text-white px-2 py-1 rounded-md text-xs font-medium hover:bg-gray-500 transition-colors"
            >
              Load Settings
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-black bg-opacity-50 backdrop-blur-sm rounded-md p-1 mb-3 border border-gray-600 border-opacity-50">
        <button
          onClick={() => setActiveTab('basic')}
          className={`flex-1 py-1 px-2 rounded text-xs font-medium transition-colors ${
            activeTab === 'basic'
              ? 'bg-crys-gold text-black'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Basic Effects
        </button>
        <button
          onClick={() => setActiveTab('premium')}
          className={`flex-1 py-1 px-2 rounded text-xs font-medium transition-colors ${
            activeTab === 'premium'
              ? 'bg-crys-gold text-black'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Premium Effects
        </button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {activeTab === 'basic' && (
          <div className="md:col-span-2 lg:col-span-3">
            <BasicEffects
              audioEffects={audioEffects}
              onUpdateEffectSettings={onUpdateEffectSettings}
              onToggleEffect={onToggleEffect}
              onManualInit={onManualInit}
            />
          </div>
        )}

        {activeTab === 'premium' && (
          <div className="md:col-span-2 lg:col-span-3">
            <PremiumEffects
              audioEffects={audioEffects}
              onUpdateEffectSettings={onUpdateEffectSettings}
              onTogglePremiumEffect={onTogglePremiumEffect}
              onManualInit={onManualInit}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StudioDashboard;

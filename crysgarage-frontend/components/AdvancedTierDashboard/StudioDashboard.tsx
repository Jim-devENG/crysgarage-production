import React from 'react';
import StudioRack from './StudioRack';
import BasicEffects from './effects/BasicEffects';

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
  manualAdjustments?: Set<string>;
  lockedEffectValues?: Record<string, any>;
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
  onManualInit,
  manualAdjustments = new Set(),
  lockedEffectValues = {}
}) => {

  return (
    <div className="bg-gray-900 rounded-lg p-3 border border-gray-600 shadow-xl">
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

      {/* Tab Navigation - Removed since all effects are now in one tab */}
      <div className="mb-3">
        <div className="text-center">
          <h4 className="text-sm font-medium text-gray-300">All Effects</h4>
          <p className="text-xs text-gray-500">Complete mastering toolkit</p>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="md:col-span-2 lg:col-span-3">
          <BasicEffects
            audioEffects={audioEffects}
            onUpdateEffectSettings={onUpdateEffectSettings}
            onToggleEffect={onToggleEffect}
            onManualInit={onManualInit}
            manualAdjustments={manualAdjustments}
            lockedEffectValues={lockedEffectValues}
          />
        </div>
      </div>
    </div>
  );
};

export default StudioDashboard;

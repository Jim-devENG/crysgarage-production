import React from 'react';
import { AlertCircle, Clock, Sparkles, X } from 'lucide-react';

interface MasteringConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  tier?: 'free' | 'professional' | 'advanced';
}

const MasteringConfirmModal: React.FC<MasteringConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  tier = 'professional'
}) => {
  if (!isOpen) return null;

  const tierNames = {
    free: 'Free Tier',
    professional: 'Professional',
    advanced: 'Advanced'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-lg w-full mx-4 border border-gray-700 animate-scaleIn">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-crys-gold to-yellow-500 p-6 rounded-t-2xl">
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 text-gray-900 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="bg-gray-900 p-2 rounded-lg">
              <Sparkles className="w-6 h-6 text-crys-gold" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                World-Class Mastering
              </h2>
              <p className="text-sm text-gray-800">{tierNames[tier]} Engine</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Info Box */}
          <div className="bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white text-sm leading-relaxed">
                  Be patient! Our advanced mastering engine needs <strong>up to 10 minutes</strong> to perform a world-class mastering process.
                </p>
              </div>
            </div>
          </div>

          {/* Promise Box */}
          <div className="bg-gradient-to-r from-purple-900 to-pink-900 bg-opacity-30 border border-purple-700 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Sparkles className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white text-sm leading-relaxed">
                  You're going to <strong>love the output</strong>! Our Crys Garage Engine delivers professional, radio-ready results.
                </p>
              </div>
            </div>
          </div>

          {/* Time Estimate */}
          <div className="flex items-center justify-center space-x-2 text-gray-400 py-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Estimated time: 2-10 minutes</span>
          </div>

          {/* What Happens Next */}
          <div className="border-t border-gray-700 pt-4">
            <h3 className="text-white font-semibold text-sm mb-2">What happens next:</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start">
                <span className="text-crys-gold mr-2">•</span>
                <span>Your audio will be uploaded and analyzed</span>
              </li>
              <li className="flex items-start">
                <span className="text-crys-gold mr-2">•</span>
                <span>Our Crys Garage Engine applies professional mastering</span>
              </li>
              <li className="flex items-start">
                <span className="text-crys-gold mr-2">•</span>
                <span>You'll get a preview and download option</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-800 bg-opacity-50 p-6 rounded-b-2xl flex flex-col-reverse sm:flex-row gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-crys-gold to-yellow-500 text-gray-900 rounded-lg font-semibold hover:from-yellow-400 hover:to-yellow-600 transition-all transform hover:scale-105"
          >
            Start Mastering
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MasteringConfirmModal;


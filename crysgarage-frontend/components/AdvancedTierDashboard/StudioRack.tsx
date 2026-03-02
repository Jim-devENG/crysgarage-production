import React from 'react';
import { Zap, Settings, Power } from 'lucide-react';

interface StudioRackProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const StudioRack: React.FC<StudioRackProps> = ({ children, title, subtitle }) => {
  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-md border border-gray-700 shadow-sm overflow-hidden">
      {/* Rack Mount Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-2 border-b border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Power LED */}
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
            
            {/* Rack Unit Label */}
            <div className="flex items-center space-x-1.5">
              <div className="bg-gradient-to-r from-crys-gold to-yellow-500 p-1 rounded">
                <Zap className="w-3 h-3 text-gray-900" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{title}</h3>
                {subtitle && <p className="text-[10px] text-gray-400">{subtitle}</p>}
              </div>
            </div>
          </div>
          
          {/* Rack Mount Screws */}
          <div className="flex space-x-1">
            <div className="w-1.5 h-1.5 bg-gray-600 rounded-full border border-gray-500"></div>
            <div className="w-1.5 h-1.5 bg-gray-600 rounded-full border border-gray-500"></div>
            <div className="w-1.5 h-1.5 bg-gray-600 rounded-full border border-gray-500"></div>
            <div className="w-1.5 h-1.5 bg-gray-600 rounded-full border border-gray-500"></div>
          </div>
        </div>
      </div>
      
      {/* Rack Content */}
      <div className="p-2">
        {children}
      </div>
      
      {/* Rack Mount Footer */}
      <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-1 border-t border-gray-600">
        <div className="flex justify-between items-center">
          <div className="flex space-x-0.5">
            <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
            <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
            <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
          </div>
          <div className="text-[8px] text-gray-500">CRYS GARAGE STUDIO</div>
          <div className="flex space-x-0.5">
            <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
            <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
            <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudioRack;

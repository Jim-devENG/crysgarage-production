import React from 'react';
import { Users, Plus } from 'lucide-react';
import { Button } from '../ui/button';

interface CommunityHeaderProps {
  onNewPost: () => void;
}

export function CommunityHeader({ onNewPost }: CommunityHeaderProps) {
  return (
    <div className="border-b border-gray-800 bg-black/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-amber-500/20 to-yellow-400/20 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Community</h1>
              <p className="text-gray-400 text-sm">Connect with fellow music producers</p>
            </div>
          </div>
          
          <Button 
            onClick={onNewPost}
            className="bg-amber-500 hover:bg-amber-600 text-black"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </div>
      </div>
    </div>
  );
}

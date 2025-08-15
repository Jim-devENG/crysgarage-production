import React from 'react';
import { Users, Plus, Home, MessageCircle, TrendingUp, Users as UsersIcon, Settings } from 'lucide-react';
import { Button } from '../ui/button';

interface CommunityHeaderProps {
  onNewPost: () => void;
}

export function CommunityHeader({ onNewPost }: CommunityHeaderProps) {
  const navItems = [
    { label: 'Home', icon: Home, href: '/', active: true },
    { label: 'Discussions', icon: MessageCircle, href: '/community', active: false },
    { label: 'Trending', icon: TrendingUp, href: '/trending', active: false },
    { label: 'Members', icon: UsersIcon, href: '/members', active: false },
    { label: 'Settings', icon: Settings, href: '/settings', active: false }
  ];

  return (
    <div className="border-b border-gray-800 bg-black/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Main Header */}
        <div className="flex items-center justify-between mb-6">
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

        {/* Navigation */}
        <nav className="flex items-center space-x-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.label}
                href={item.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  item.active
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </a>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

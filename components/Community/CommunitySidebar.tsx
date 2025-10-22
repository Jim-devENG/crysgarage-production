import React from 'react';
import { 
  MessageCircle, 
  Clock, 
  Music, 
  TrendingUp, 
  Users, 
  Star,
  Search,
  Mic,
  Headphones
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Input } from '../ui/input';

interface CommunitySidebarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  sortBy: 'latest' | 'popular' | 'trending';
  onSortChange: (sort: 'latest' | 'popular' | 'trending') => void;
}

export function CommunitySidebar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange
}: CommunitySidebarProps) {
  const categories = [
    { id: 'all', name: 'All Posts', icon: MessageCircle },
    { id: 'music', name: 'Music', icon: Music },
    { id: 'production', name: 'Production', icon: Mic },
    { id: 'gear', name: 'Gear', icon: Headphones },
    { id: 'collaboration', name: 'Collaboration', icon: Users },
    { id: 'showcase', name: 'Showcase', icon: Star }
  ];

  const sortOptions = [
    { id: 'latest', name: 'Latest', icon: Clock },
    { id: 'popular', name: 'Popular', icon: TrendingUp },
    { id: 'trending', name: 'Trending', icon: TrendingUp }
  ];

  return (
    <div className="lg:col-span-1 space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
        />
      </div>

      {/* Categories */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <h3 className="text-white font-semibold">Categories</h3>
        </CardHeader>
        <CardContent className="space-y-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{category.name}</span>
              </button>
            );
          })}
        </CardContent>
      </Card>

      {/* Sort Options */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <h3 className="text-white font-semibold">Sort By</h3>
        </CardHeader>
        <CardContent className="space-y-2">
          {sortOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => onSortChange(option.id as any)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  sortBy === option.id
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{option.name}</span>
              </button>
            );
          })}
        </CardContent>
      </Card>

      {/* Community Stats */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <h3 className="text-white font-semibold">Community Stats</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Total Members</span>
            <span className="text-white font-medium">12,847</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Active Today</span>
            <span className="text-amber-400 font-medium">1,234</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Posts Today</span>
            <span className="text-white font-medium">89</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import React, { useState } from 'react';
import { 
  Heart, 
  Share2, 
  MoreHorizontal, 
  Send, 
  MessageSquare,
  Bookmark
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Input } from '../ui/input';
import { Post, User } from './types';
import { mockUsers } from './data/mockData';

interface PostCardProps {
  post: Post;
  currentUser?: User;
  onLike: (postId: string) => void;
  onBookmark: (postId: string) => void;
}

export function PostCard({ post, currentUser, onLike, onBookmark }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (newComment.trim()) {
      setNewComment('');
      setShowComments(false);
    }
  };

  const getRoleBadge = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-500/20 text-red-400 text-xs">Admin</Badge>;
      case 'moderator':
        return <Badge className="bg-blue-500/20 text-blue-400 text-xs">Mod</Badge>;
      case 'premium':
        return <Badge className="bg-amber-500/20 text-amber-400 text-xs">Premium</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.author.avatar} />
              <AvatarFallback className="bg-amber-500/20 text-amber-400">
                {post.author.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-white font-medium">{post.author.name}</span>
                {getRoleBadge(post.author.role)}
                {post.isPinned && <Badge className="bg-green-500/20 text-green-400 text-xs">Pinned</Badge>}
                {post.isFeatured && <Badge className="bg-amber-500/20 text-amber-400 text-xs">Featured</Badge>}
              </div>
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <span>@{post.author.username}</span>
                <span>•</span>
                <span>{post.timestamp}</span>
                <span>•</span>
                <span className="capitalize">{post.category}</span>
              </div>
            </div>
          </div>
          <button className="text-gray-400 hover:text-white">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-white font-semibold text-lg mb-2">{post.title}</h3>
          <p className="text-gray-300 leading-relaxed">{post.content}</p>
        </div>

        {post.media && (
          <div className="rounded-lg overflow-hidden">
            {post.media.type === 'image' && (
              <img 
                src={post.media.url} 
                alt="Post media" 
                className="w-full h-64 object-cover"
              />
            )}
            {post.media.type === 'video' && (
              <video 
                src={post.media.url} 
                controls 
                className="w-full h-64 object-cover"
              />
            )}
            {post.media.type === 'audio' && (
              <audio 
                src={post.media.url} 
                controls 
                className="w-full"
              />
            )}
          </div>
        )}

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge 
                key={tag} 
                className="bg-gray-700 text-gray-300 hover:bg-amber-500/20 hover:text-amber-400 cursor-pointer"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Post Stats */}
        <div className="flex items-center justify-between text-gray-400 text-sm">
          <div className="flex items-center space-x-4">
            <span>{post.views} views</span>
            <span>{post.shares} shares</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => onLike(post.id)}
              className={`flex items-center space-x-2 transition-colors ${
                post.isLiked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
              }`}
            >
              <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
              <span>{post.likes}</span>
            </button>
            
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 text-gray-400 hover:text-amber-400 transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              <span>{post.comments}</span>
            </button>
            
            <button className="flex items-center space-x-2 text-gray-400 hover:text-amber-400 transition-colors">
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onBookmark(post.id)}
              className={`p-2 rounded-lg transition-colors ${
                post.isBookmarked 
                  ? 'text-amber-400 bg-amber-500/20' 
                  : 'text-gray-400 hover:text-amber-400 hover:bg-gray-700'
              }`}
            >
              <Bookmark className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="pt-4 border-t border-gray-700 space-y-4">
            <div className="flex items-center space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={currentUser?.avatar} />
                <AvatarFallback className="bg-amber-500/20 text-amber-400 text-xs">
                  {currentUser?.name.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Input
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              <Button
                onClick={handleAddComment}
                className="bg-amber-500 hover:bg-amber-600 text-black"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Mock Comments */}
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-start space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={mockUsers[i % mockUsers.length].avatar} />
                    <AvatarFallback className="bg-amber-500/20 text-amber-400 text-xs">
                      {mockUsers[i % mockUsers.length].name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-white font-medium text-sm">
                          {mockUsers[i % mockUsers.length].name}
                        </span>
                        {getRoleBadge(mockUsers[i % mockUsers.length].role)}
                        <span className="text-gray-400 text-xs">2 hours ago</span>
                      </div>
                      <p className="text-gray-300 text-sm">
                        {i === 1 ? 'Great post! I totally agree about the compression approach.' : 'Thanks for sharing this! Very helpful insights.'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                      <button className="hover:text-amber-400">Like</button>
                      <button className="hover:text-amber-400">Reply</button>
                      <button className="hover:text-amber-400">Quote</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

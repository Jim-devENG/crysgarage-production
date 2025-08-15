import React from 'react';
import { MessageCircle, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Post, User } from './types';
import { PostCard } from './PostCard';

interface PostListProps {
  posts: Post[];
  currentUser?: User;
  onPostsChange: (posts: Post[]) => void;
}

export function PostList({ posts, currentUser, onPostsChange }: PostListProps) {
  const handleLikePost = (postId: string) => {
    const updatedPosts = posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.isLiked ? post.likes - 1 : post.likes + 1, isLiked: !post.isLiked }
        : post
    );
    onPostsChange(updatedPosts);
  };

  const handleBookmarkPost = (postId: string) => {
    const updatedPosts = posts.map(post => 
      post.id === postId 
        ? { ...post, isBookmarked: !post.isBookmarked }
        : post
    );
    onPostsChange(updatedPosts);
  };

  if (posts.length === 0) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-amber-500/20 to-yellow-400/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-amber-400" />
          </div>
          <h3 className="text-white font-semibold mb-2">No posts found</h3>
          <p className="text-gray-400 mb-6">Try adjusting your search or filters</p>
          <Button 
            className="bg-amber-500 hover:bg-amber-600 text-black"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create First Post
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUser={currentUser}
          onLike={handleLikePost}
          onBookmark={handleBookmarkPost}
        />
      ))}
    </div>
  );
}

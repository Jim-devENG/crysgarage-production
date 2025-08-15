import React, { useState, useEffect } from 'react';
import { Users, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { CommunityHeader } from './CommunityHeader';
import { CommunitySidebar } from './CommunitySidebar';
import { PostList } from './PostList';
import { CreatePostModal } from './CreatePostModal';
import { mockUsers, mockPosts } from './data/mockData';
import { Post, User } from './types';

interface CommunityPageProps {
  currentUser?: User;
}

export function CommunityPage({ currentUser }: CommunityPageProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'trending'>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);

  useEffect(() => {
    setPosts(mockPosts);
  }, []);

  const handleCreatePost = (newPostData: { title: string; content: string; category: Post['category']; tags: string[] }) => {
    const post: Post = {
      id: Date.now().toString(),
      title: newPostData.title,
      content: newPostData.content,
      author: currentUser || mockUsers[0],
      timestamp: 'Just now',
      likes: 0,
      comments: 0,
      shares: 0,
      views: 0,
      category: newPostData.category,
      tags: newPostData.tags,
      isLiked: false,
      isBookmarked: false
    };
    setPosts(prev => [post, ...prev]);
    setShowCreatePost(false);
  };

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.likes - a.likes;
      case 'trending':
        return (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares);
      default:
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <CommunityHeader onNewPost={() => setShowCreatePost(true)} />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <CommunitySidebar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
          
          <div className="lg:col-span-3 space-y-6">
            {showCreatePost && (
              <CreatePostModal
                onClose={() => setShowCreatePost(false)}
                onSubmit={handleCreatePost}
              />
            )}
            
            <PostList 
              posts={sortedPosts}
              currentUser={currentUser}
              onPostsChange={setPosts}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

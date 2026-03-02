import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthenticationContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { 
  MessageCircle, 
  Plus, 
  Clock, 
  User, 
  Reply, 
  Send,
  LogIn,
  AlertCircle,
  Heart,
  Eye,
  Search,
  Filter,
  Pin,
  Lock,
  Flag,
  TrendingUp,
  Users,
  Tag,
  Menu,
  X,
  Bell,
  BellOff
} from 'lucide-react';

interface Comment {
  id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  content: string;
  timestamp: string;
  likes: number;
  liked_by: string[];
  is_edited: boolean;
  edited_at?: string;
}

interface Post {
  id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  timestamp: string;
  comments: Comment[];
  likes: number;
  liked_by: string[];
  views: number;
  is_pinned: boolean;
  is_locked: boolean;
  is_edited: boolean;
  edited_at?: string;
}

interface MobileForumSectionProps {
  onShowAuthModal?: () => void;
}

export function MobileForumSection({ onShowAuthModal }: MobileForumSectionProps) {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newComment, setNewComment] = useState<{ [postId: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [pullToRefresh, setPullToRefresh] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  
  const touchStartY = useRef(0);
  const touchCurrentY = useRef(0);
  const isPulling = useRef(false);

  // Fetch posts
  const fetchPosts = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      params.append('sort', 'newest');
      params.append('limit', '20');
      
      const response = await fetch(`/api/forum/posts?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
        setLastRefresh(Date.now());
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
      setPullToRefresh(false);
    }
  };

  // Auto-refresh posts every 30 seconds
  useEffect(() => {
    fetchPosts();
    const interval = setInterval(() => fetchPosts(false), 30000);
    return () => clearInterval(interval);
  }, [searchQuery]);

  // Touch gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    isPulling.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      touchCurrentY.current = e.touches[0].clientY;
      const pullDistance = touchCurrentY.current - touchStartY.current;
      
      if (pullDistance > 50 && !isPulling.current) {
        isPulling.current = true;
        setPullToRefresh(true);
      }
    }
  };

  const handleTouchEnd = () => {
    if (pullToRefresh) {
      fetchPosts(false);
    }
    isPulling.current = false;
  };

  // Create new post
  const handleCreatePost = async () => {
    if (!isAuthenticated) {
      onShowAuthModal?.();
      return;
    }

    if (!newPostTitle.trim() || !newPostContent.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('crysgarage_firebase_token');
      const response = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newPostTitle,
          content: newPostContent,
          category: 'general',
          tags: []
        })
      });

      if (response.ok) {
        setNewPostTitle('');
        setNewPostContent('');
        setShowNewPostModal(false);
        fetchPosts(false);
      } else {
        alert('Failed to create post');
      }
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  // Add comment
  const handleAddComment = async (postId: string) => {
    if (!isAuthenticated) {
      onShowAuthModal?.();
      return;
    }

    const commentContent = newComment[postId];
    if (!commentContent?.trim()) {
      alert('Please enter a comment');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('crysgarage_firebase_token');
      const response = await fetch('/api/forum/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          post_id: postId,
          content: commentContent
        })
      });

      if (response.ok) {
        setNewComment(prev => ({ ...prev, [postId]: '' }));
        fetchPosts(false);
      } else {
        alert('Failed to add comment');
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle like
  const handleToggleLike = async (postId?: string, commentId?: string) => {
    if (!isAuthenticated) {
      onShowAuthModal?.();
      return;
    }

    try {
      const token = localStorage.getItem('crysgarage_firebase_token');
      const response = await fetch('/api/forum/reactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          post_id: postId,
          comment_id: commentId,
          reaction: 'like'
        })
      });

      if (response.ok) {
        fetchPosts(false);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-crys-light-grey">Loading forum...</div>
      </div>
    );
  }

  return (
    <div 
      className="max-w-4xl mx-auto px-4 py-6"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      {pullToRefresh && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-crys-gold text-crys-black text-center py-2">
          <div className="animate-spin w-4 h-4 border-2 border-crys-black border-t-transparent rounded-full mx-auto"></div>
          <span className="text-sm font-medium">Pull to refresh</span>
        </div>
      )}

      {/* Mobile Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-crys-white">Community</h2>
          <p className="text-crys-light-grey text-sm">Share & connect</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="text-crys-light-grey hover:text-crys-white"
          >
            <Filter className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setNotifications(!notifications)}
            className={notifications ? "text-crys-gold" : "text-crys-light-grey hover:text-crys-white"}
          >
            {notifications ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </Button>
          
          {isAuthenticated ? (
            <Button
              onClick={() => setShowNewPostModal(true)}
              className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black font-semibold px-3 py-2"
            >
              <Plus className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={onShowAuthModal}
              className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black font-semibold px-3 py-2"
            >
              <LogIn className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Search */}
      {showFilters && (
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-crys-light-grey" />
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-crys-graphite border-crys-graphite text-crys-white placeholder-crys-light-grey"
            />
          </div>
        </div>
      )}

      {/* Mobile Posts List */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card className="bg-crys-charcoal border-crys-graphite">
            <CardContent className="p-6 text-center">
              <MessageCircle className="w-10 h-10 text-crys-gold mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-crys-white mb-2">No posts yet</h3>
              <p className="text-crys-light-grey text-sm mb-4">
                Be the first to start a discussion!
              </p>
              {isAuthenticated ? (
                <Button
                  onClick={() => setShowNewPostModal(true)}
                  className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Post
                </Button>
              ) : (
                <Button
                  onClick={onShowAuthModal}
                  className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className={`bg-crys-charcoal border-crys-graphite hover:border-crys-gold/50 transition-all duration-300 ${post.is_pinned ? 'border-crys-gold/30 bg-crys-gold/5' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {post.is_pinned && <Pin className="w-3 h-3 text-crys-gold flex-shrink-0" />}
                      {post.is_locked && <Lock className="w-3 h-3 text-crys-gold flex-shrink-0" />}
                      <CardTitle className="text-crys-white text-base leading-tight">{post.title}</CardTitle>
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-crys-light-grey mb-2">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {post.author_name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(post.timestamp)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <Reply className="w-3 h-3" />
                        {post.comments.length}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {post.views}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {post.likes}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                    className="text-crys-gold hover:text-crys-gold-muted p-1"
                  >
                    <Menu className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-crys-light-grey text-sm mb-3 line-clamp-3">{post.content}</p>
                
                {/* Mobile Action Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleLike(post.id)}
                      className={`${post.liked_by.includes(user?.id || '') ? 'text-crys-gold' : 'text-crys-light-grey'} hover:text-crys-gold p-1`}
                    >
                      <Heart className={`w-4 h-4 ${post.liked_by.includes(user?.id || '') ? 'fill-current' : ''}`} />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                      className="text-crys-light-grey hover:text-crys-gold p-1"
                    >
                      <Reply className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-crys-light-grey hover:text-crys-gold p-1"
                  >
                    <Flag className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Comments Section - Mobile Optimized */}
                {expandedPost === post.id && (
                  <div className="border-t border-crys-graphite pt-3 mt-3">
                    <h4 className="text-crys-white font-semibold text-sm mb-3">Comments</h4>
                    
                    {/* Comments List */}
                    <div className="space-y-2 mb-3">
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="bg-crys-graphite/50 rounded-lg p-2">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3 text-crys-gold" />
                              <span className="text-crys-white font-medium text-xs">{comment.author_name}</span>
                              <span className="text-crys-light-grey text-xs">
                                {formatTimestamp(comment.timestamp)}
                              </span>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleLike(undefined, comment.id)}
                              className={`${comment.liked_by.includes(user?.id || '') ? 'text-crys-gold' : 'text-crys-light-grey'} hover:text-crys-gold p-1`}
                            >
                              <Heart className={`w-3 h-3 ${comment.liked_by.includes(user?.id || '') ? 'fill-current' : ''}`} />
                            </Button>
                          </div>
                          <p className="text-crys-light-grey text-xs">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                    
                    {/* Add Comment Form - Mobile */}
                    {isAuthenticated ? (
                      <div className="space-y-2">
                        <Textarea
                          placeholder="Write a comment..."
                          value={newComment[post.id] || ''}
                          onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                          className="bg-crys-graphite border-crys-graphite text-crys-white placeholder-crys-light-grey text-sm"
                          rows={2}
                        />
                        <div className="flex justify-end">
                          <Button
                            onClick={() => handleAddComment(post.id)}
                            disabled={submitting || !newComment[post.id]?.trim()}
                            className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black text-xs px-3 py-1"
                            size="sm"
                          >
                            <Send className="w-3 h-3 mr-1" />
                            {submitting ? 'Posting...' : 'Post'}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-crys-graphite/30 border border-crys-graphite rounded-lg p-3 text-center">
                        <AlertCircle className="w-4 h-4 text-crys-gold mx-auto mb-2" />
                        <p className="text-crys-light-grey text-xs mb-2">Sign in to join the discussion</p>
                        <Button
                          onClick={onShowAuthModal}
                          className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black text-xs px-3 py-1"
                          size="sm"
                        >
                          <LogIn className="w-3 h-3 mr-1" />
                          Sign In
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Mobile New Post Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <Card className="bg-crys-charcoal border-crys-graphite w-full max-h-[80vh] rounded-t-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-crys-white">New Post</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNewPostModal(false)}
                className="text-crys-light-grey hover:text-crys-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pb-6">
              <Input
                placeholder="Post title..."
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                className="bg-crys-graphite border-crys-graphite text-crys-white placeholder-crys-light-grey"
              />
              
              <Textarea
                placeholder="What's on your mind?"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="bg-crys-graphite border-crys-graphite text-crys-white placeholder-crys-light-grey"
                rows={4}
              />
              
              <div className="flex justify-end gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setShowNewPostModal(false)}
                  className="text-crys-light-grey hover:text-crys-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePost}
                  disabled={submitting || !newPostTitle.trim() || !newPostContent.trim()}
                  className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black"
                >
                  {submitting ? 'Creating...' : 'Create Post'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

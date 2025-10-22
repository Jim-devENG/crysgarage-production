import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthenticationContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
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
  Edit,
  Trash2,
  Flag,
  TrendingUp,
  Users,
  Tag,
  MoreHorizontal,
  ChevronDown,
  ChevronUp
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

interface Category {
  id: string;
  name: string;
  description: string;
}

interface ForumSectionProps {
  onShowAuthModal?: () => void;
}

export function EnhancedForumSection({ onShowAuthModal }: ForumSectionProps) {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState('newest');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('general');
  const [newPostTags, setNewPostTags] = useState<string[]>([]);
  const [newComment, setNewComment] = useState<{ [postId: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState<{postId?: string, commentId?: string} | null>(null);

  // Fetch posts with filters
  const fetchPosts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      params.append('sort', sortBy);
      params.append('limit', '50');
      
      const response = await fetch(`/api/forum/posts?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery, sortBy]);

  // Fetch categories and tags
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/forum/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/forum/tags');
      if (response.ok) {
        const data = await response.json();
        setTags(data.tags || []);
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  };

  // Auto-refresh posts every 30 seconds
  useEffect(() => {
    fetchPosts();
    fetchCategories();
    fetchTags();
    const interval = setInterval(fetchPosts, 30000);
    return () => clearInterval(interval);
  }, [fetchPosts]);

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
          category: newPostCategory,
          tags: newPostTags
        })
      });

      if (response.ok) {
        setNewPostTitle('');
        setNewPostContent('');
        setNewPostCategory('general');
        setNewPostTags([]);
        setShowNewPostModal(false);
        fetchPosts();
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

  // Add comment to post
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
        fetchPosts();
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

  // Toggle like on post or comment
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
        fetchPosts();
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  // Report content
  const handleReport = async (reason: string, description?: string) => {
    if (!isAuthenticated) {
      onShowAuthModal?.();
      return;
    }

    try {
      const token = localStorage.getItem('crysgarage_firebase_token');
      const response = await fetch('/api/forum/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          post_id: showReportModal?.postId,
          comment_id: showReportModal?.commentId,
          reason,
          description
        })
      });

      if (response.ok) {
        setShowReportModal(null);
        alert('Report submitted successfully');
      } else {
        alert('Failed to submit report');
      }
    } catch (error) {
      console.error('Failed to submit report:', error);
      alert('Failed to submit report');
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

  // Get category name
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || categoryId;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-crys-light-grey">Loading forum...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-crys-white mb-2">Community Forum</h2>
          <p className="text-crys-light-grey">Share your music, get feedback, and connect with other creators</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="border-crys-graphite text-crys-light-grey hover:text-crys-white"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          
          {isAuthenticated ? (
            <Button
              onClick={() => setShowNewPostModal(true)}
              className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          ) : (
            <Button
              onClick={onShowAuthModal}
              className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black font-semibold"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In to Post
            </Button>
          )}
        </div>
      </div>

      {/* Enhanced Filters */}
      {showFilters && (
        <Card className="bg-crys-charcoal border-crys-graphite mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-crys-white text-sm font-medium mb-2 block">Search</label>
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
              
              <div>
                <label className="text-crys-white text-sm font-medium mb-2 block">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-crys-graphite border-crys-graphite text-crys-white">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-crys-white text-sm font-medium mb-2 block">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-crys-graphite border-crys-graphite text-crys-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="most_liked">Most Liked</SelectItem>
                    <SelectItem value="most_commented">Most Comments</SelectItem>
                    <SelectItem value="most_viewed">Most Viewed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Posts List */}
      <div className="space-y-6">
        {posts.length === 0 ? (
          <Card className="bg-crys-charcoal border-crys-graphite">
            <CardContent className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-crys-gold mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-crys-white mb-2">No posts found</h3>
              <p className="text-crys-light-grey mb-4">
                {searchQuery || selectedCategory 
                  ? "No posts match your current filters. Try adjusting your search criteria."
                  : "Be the first to start a discussion in our community forum!"
                }
              </p>
              {isAuthenticated ? (
                <Button
                  onClick={() => setShowNewPostModal(true)}
                  className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Post
                </Button>
              ) : (
                <Button
                  onClick={onShowAuthModal}
                  className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In to Post
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className={`bg-crys-charcoal border-crys-graphite hover:border-crys-gold/50 transition-all duration-300 ${post.is_pinned ? 'border-crys-gold/30 bg-crys-gold/5' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {post.is_pinned && <Pin className="w-4 h-4 text-crys-gold" />}
                      {post.is_locked && <Lock className="w-4 h-4 text-crys-gold" />}
                      <CardTitle className="text-crys-white text-lg">{post.title}</CardTitle>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-crys-light-grey mb-3">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {post.author_name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatTimestamp(post.timestamp)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Reply className="w-4 h-4" />
                        {post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {post.views} views
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="bg-crys-gold/20 text-crys-gold">
                        {getCategoryName(post.category)}
                      </Badge>
                      {post.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="border-crys-graphite text-crys-light-grey">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                      className="text-crys-gold hover:text-crys-gold-muted"
                    >
                      {expandedPost === post.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      {expandedPost === post.id ? 'Hide' : 'View'} Comments
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleLike(post.id)}
                      className={`${post.liked_by.includes(user?.id || '') ? 'text-crys-gold' : 'text-crys-light-grey'} hover:text-crys-gold`}
                    >
                      <Heart className={`w-4 h-4 ${post.liked_by.includes(user?.id || '') ? 'fill-current' : ''}`} />
                      {post.likes}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowReportModal({ postId: post.id })}
                      className="text-crys-light-grey hover:text-crys-gold"
                    >
                      <Flag className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-crys-light-grey mb-4 whitespace-pre-wrap">{post.content}</p>
                
                {/* Comments Section */}
                {expandedPost === post.id && (
                  <div className="border-t border-crys-graphite pt-4">
                    <h4 className="text-crys-white font-semibold mb-4">Comments</h4>
                    
                    {/* Comments List */}
                    <div className="space-y-3 mb-4">
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="bg-crys-graphite/50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-crys-gold" />
                              <span className="text-crys-white font-medium">{comment.author_name}</span>
                              <span className="text-crys-light-grey text-sm">
                                {formatTimestamp(comment.timestamp)}
                              </span>
                              {comment.is_edited && (
                                <span className="text-crys-light-grey text-xs">(edited)</span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleLike(undefined, comment.id)}
                                className={`${comment.liked_by.includes(user?.id || '') ? 'text-crys-gold' : 'text-crys-light-grey'} hover:text-crys-gold`}
                              >
                                <Heart className={`w-3 h-3 ${comment.liked_by.includes(user?.id || '') ? 'fill-current' : ''}`} />
                                {comment.likes}
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowReportModal({ commentId: comment.id })}
                                className="text-crys-light-grey hover:text-crys-gold"
                              >
                                <Flag className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-crys-light-grey text-sm whitespace-pre-wrap">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                    
                    {/* Add Comment Form */}
                    {isAuthenticated ? (
                      <div className="space-y-3">
                        <Textarea
                          placeholder="Write a comment..."
                          value={newComment[post.id] || ''}
                          onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                          className="bg-crys-graphite border-crys-graphite text-crys-white placeholder-crys-light-grey"
                          rows={3}
                        />
                        <div className="flex justify-end">
                          <Button
                            onClick={() => handleAddComment(post.id)}
                            disabled={submitting || !newComment[post.id]?.trim()}
                            className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black"
                            size="sm"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            {submitting ? 'Posting...' : 'Post Comment'}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-crys-graphite/30 border border-crys-graphite rounded-lg p-4 text-center">
                        <AlertCircle className="w-5 h-5 text-crys-gold mx-auto mb-2" />
                        <p className="text-crys-light-grey mb-3">You must sign in to join the discussion</p>
                        <Button
                          onClick={onShowAuthModal}
                          className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black"
                          size="sm"
                        >
                          <LogIn className="w-4 h-4 mr-2" />
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

      {/* Enhanced New Post Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-crys-charcoal border-crys-graphite w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-crys-white">Create New Post</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Post title..."
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                className="bg-crys-graphite border-crys-graphite text-crys-white placeholder-crys-light-grey"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-crys-white text-sm font-medium mb-2 block">Category</label>
                  <Select value={newPostCategory} onValueChange={setNewPostCategory}>
                    <SelectTrigger className="bg-crys-graphite border-crys-graphite text-crys-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-crys-white text-sm font-medium mb-2 block">Tags (comma-separated)</label>
                  <Input
                    placeholder="mixing, mastering, hip-hop"
                    value={newPostTags.join(', ')}
                    onChange={(e) => setNewPostTags(e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                    className="bg-crys-graphite border-crys-graphite text-crys-white placeholder-crys-light-grey"
                  />
                </div>
              </div>
              
              <Textarea
                placeholder="What's on your mind? Share your music, ask for feedback, or start a discussion..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="bg-crys-graphite border-crys-graphite text-crys-white placeholder-crys-light-grey"
                rows={6}
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

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-crys-charcoal border-crys-graphite w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-crys-white">Report Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-crys-white text-sm font-medium mb-2 block">Reason</label>
                <Select onValueChange={(value) => handleReport(value)}>
                  <SelectTrigger className="bg-crys-graphite border-crys-graphite text-crys-white">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spam">Spam</SelectItem>
                    <SelectItem value="inappropriate">Inappropriate Content</SelectItem>
                    <SelectItem value="harassment">Harassment</SelectItem>
                    <SelectItem value="off-topic">Off-topic</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setShowReportModal(null)}
                  className="text-crys-light-grey hover:text-crys-white"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

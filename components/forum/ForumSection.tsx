import React, { useState, useEffect } from 'react';
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
  AlertCircle
} from 'lucide-react';

interface Comment {
  id: string;
  author_id: string;
  author_name: string;
  content: string;
  timestamp: string;
}

interface Post {
  id: string;
  author_id: string;
  author_name: string;
  title: string;
  content: string;
  timestamp: string;
  comments: Comment[];
}

interface ForumSectionProps {
  onShowAuthModal?: () => void;
}

export function ForumSection({ onShowAuthModal }: ForumSectionProps) {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newComment, setNewComment] = useState<{ [postId: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch posts from backend
  const fetchPosts = async () => {
    try {
      // Try to load from localStorage first for faster display
      const cachedPosts = localStorage.getItem('forum_posts');
      if (cachedPosts) {
        try {
          const parsedPosts = JSON.parse(cachedPosts);
          setPosts(parsedPosts);
        } catch (e) {
          console.log('Failed to parse cached posts');
        }
      }

      const response = await fetch('/api/forum/posts');
      if (response.ok) {
        const data = await response.json();
        const fetchedPosts = data.posts || [];
        setPosts(fetchedPosts);
        
        // Cache posts to localStorage for persistence
        localStorage.setItem('forum_posts', JSON.stringify(fetchedPosts));
        localStorage.setItem('forum_posts_timestamp', Date.now().toString());
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      // Fallback to cached data if available
      const cachedPosts = localStorage.getItem('forum_posts');
      if (cachedPosts) {
        try {
          const parsedPosts = JSON.parse(cachedPosts);
          setPosts(parsedPosts);
        } catch (e) {
          console.log('Failed to parse cached posts on error');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh posts every 30 seconds
  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 30000);
    return () => clearInterval(interval);
  }, []);

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
          content: newPostContent
        })
      });

      if (response.ok) {
        setNewPostTitle('');
        setNewPostContent('');
        setShowNewPostModal(false);
        fetchPosts(); // Refresh posts
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
        fetchPosts(); // Refresh posts
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
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-crys-white mb-2">Community Forum</h2>
          <p className="text-crys-light-grey">Share your music, get feedback, and connect with other creators</p>
        </div>
        
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

      {/* Posts List */}
      <div className="space-y-6">
        {posts.length === 0 ? (
          <Card className="bg-crys-charcoal border-crys-graphite">
            <CardContent className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-crys-gold mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-crys-white mb-2">No posts yet</h3>
              <p className="text-crys-light-grey mb-4">
                Be the first to start a discussion in our community forum!
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
            <Card key={post.id} className="bg-crys-charcoal border-crys-graphite hover:border-crys-gold/50 transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-crys-white text-lg mb-2">{post.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-crys-light-grey">
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
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                    className="text-crys-gold hover:text-crys-gold-muted"
                  >
                    {expandedPost === post.id ? 'Hide' : 'View'} Comments
                  </Button>
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
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-crys-gold" />
                            <span className="text-crys-white font-medium">{comment.author_name}</span>
                            <span className="text-crys-light-grey text-sm">
                              {formatTimestamp(comment.timestamp)}
                            </span>
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

      {/* New Post Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-crys-charcoal border-crys-graphite w-full max-w-2xl">
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
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { WhatsAppCommunity } from './WhatsAppCommunity';
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
  Send,
  LogIn,
  AlertCircle,
  Heart,
  Eye,
  Search,
  Filter,
  Users,
  Tag,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  MessageSquare
} from 'lucide-react';

interface CommunityPageProps {
  currentUser?: any;
  onShowAuthModal?: () => void;
}

export function CommunityPage({ currentUser, onShowAuthModal }: CommunityPageProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [newComment, setNewComment] = useState<{ [postId: string]: string }>({});
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Check if user is authenticated
  const isAuthenticated = currentUser && (currentUser.uid || currentUser.email);
  
  // Debug logging
  useEffect(() => {
    console.log('Community Auth Debug:', {
      currentUser,
      isAuthenticated,
      hasUid: !!currentUser?.uid,
      hasEmail: !!currentUser?.email
    });
  }, [currentUser, isAuthenticated]);

  // Simple API call to get posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('https://crysgarage.studio/api/forum/posts');
        if (response.ok) {
          const data = await response.json();
          setPosts(data.posts || []);
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    // More accurate time formatting
    if (diffMs < 0) return 'Just now'; // Future timestamp
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
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
      const response = await fetch('https://crysgarage.studio/api/forum/posts', {
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
        // Refresh posts
        const refreshResponse = await fetch('https://crysgarage.studio/api/forum/posts');
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setPosts(data.posts || []);
        }
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
      const response = await fetch('https://crysgarage.studio/api/forum/comments', {
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
        // Refresh posts
        const refreshResponse = await fetch('https://crysgarage.studio/api/forum/posts');
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setPosts(data.posts || []);
        }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-crys-light-grey">Loading enhanced forum...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-crys-dark-grey">
      {/* Enhanced Header */}
      <div className="bg-crys-charcoal border-b border-crys-graphite">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-crys-white mb-2">Community</h1>
              <p className="text-crys-light-grey text-lg">Share your music, get feedback, and connect with other creators</p>
            </div>
            
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Button
                  onClick={() => setShowNewPostModal(true)}
                  className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black font-semibold px-6 py-3"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  New Post
                </Button>
              ) : (
                <Button
                  onClick={onShowAuthModal}
                  className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black font-semibold px-6 py-3"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In to Post
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Forum Section - Takes 2/3 of the space */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-crys-white mb-4">Community Forum</h2>
              <p className="text-crys-light-grey">Join the discussion and share your music</p>
            </div>

            <div className="space-y-6">
              {posts.length === 0 ? (
                <Card className="bg-crys-charcoal border-crys-graphite">
                  <CardContent className="p-12 text-center">
                    <MessageCircle className="w-16 h-16 text-crys-gold mx-auto mb-6" />
                    <h3 className="text-2xl font-semibold text-crys-white mb-4">No posts yet</h3>
                    <p className="text-crys-light-grey text-lg mb-6">
                      Be the first to start a discussion in our community forum!
                    </p>
                    {isAuthenticated ? (
                      <Button
                        onClick={() => setShowNewPostModal(true)}
                        className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black px-8 py-3"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Create First Post
                      </Button>
                    ) : (
                      <Button
                        onClick={onShowAuthModal}
                        className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black px-8 py-3"
                      >
                        <LogIn className="w-5 h-5 mr-2" />
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
                          <CardTitle className="text-crys-white text-xl mb-2">{post.title}</CardTitle>
                          
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
                              <MessageSquare className="w-4 h-4" />
                              {post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {post.views} views
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="secondary" className="bg-crys-gold/20 text-crys-gold">
                              {post.category}
                            </Badge>
                            {post.tags.map((tag: string, index: number) => (
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
                            className="text-crys-light-grey hover:text-crys-gold"
                          >
                            <ThumbsUp className="w-4 h-4" />
                            {post.likes}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <p className="text-crys-light-grey mb-4 whitespace-pre-wrap">{post.content}</p>
                      
                      {/* Comments Section */}
                      {expandedPost === post.id && (
                        <div className="border-t border-crys-graphite pt-6">
                          <h4 className="text-lg font-semibold text-crys-gold mb-4">Comments</h4>
                          
                          {/* Comments List */}
                          <div className="space-y-4 mb-6">
                            {post.comments.map((comment: any) => (
                              <div key={comment.id} className="bg-crys-graphite/50 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-crys-gold" />
                                    <span className="text-crys-white font-medium">{comment.author_name}</span>
                                    <span className="text-crys-light-grey text-sm">
                                      {formatTimestamp(comment.timestamp)}
                                    </span>
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
          </div>

          {/* WhatsApp Community Section - Takes 1/3 of the space */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-crys-white mb-4">WhatsApp Community</h2>
              <p className="text-crys-light-grey">Join our vibrant community</p>
            </div>
            
            <Card className="bg-crys-charcoal border-crys-graphite">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-crys-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-crys-gold" />
                  </div>
                  <h3 className="text-xl font-semibold text-crys-white mb-2">Join Our Community</h3>
                  <p className="text-crys-light-grey text-sm mb-4">
                    Connect with producers, artists, and audio engineers worldwide
                  </p>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-crys-light-grey">
                    <Users className="w-4 h-4 text-crys-gold" />
                    <span>500+ Active Members</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-crys-light-grey">
                    <MessageCircle className="w-4 h-4 text-crys-gold" />
                    <span>1000+ Daily Messages</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-crys-light-grey">
                    <Heart className="w-4 h-4 text-crys-gold" />
                    <span>2000+ Tracks Shared</span>
                  </div>
                </div>
                
                <Button
                  onClick={() => window.open('https://chat.whatsapp.com/L1eDQaPVv5L2KZE0754QD3?mode=ems_copy_c', '_blank')}
                  className="w-full bg-crys-gold hover:bg-crys-gold-muted text-crys-black font-semibold"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Join WhatsApp Community
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
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

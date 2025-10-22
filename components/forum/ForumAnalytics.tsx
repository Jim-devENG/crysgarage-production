import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  TrendingUp, 
  Users, 
  MessageCircle, 
  Heart, 
  Eye, 
  Tag,
  BarChart3,
  Activity,
  Calendar,
  Award,
  Reply
} from 'lucide-react';

interface Analytics {
  total_posts: number;
  total_comments: number;
  total_users: number;
  most_active_users: Array<{user_id: string, activity: number}>;
  popular_categories: Array<{category: string, count: number}>;
  popular_tags: string[];
}

interface ForumAnalyticsProps {
  isAdmin?: boolean;
}

export function ForumAnalytics({ isAdmin = false }: ForumAnalyticsProps) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/forum/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-crys-light-grey">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <div className="text-crys-light-grey">No analytics data available</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-crys-white mb-2">Forum Analytics</h2>
        <p className="text-crys-light-grey">Community engagement and activity insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-crys-charcoal border-crys-graphite">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-crys-light-grey text-sm">Total Posts</p>
                <p className="text-2xl font-bold text-crys-white">{analytics.total_posts}</p>
              </div>
              <MessageCircle className="w-8 h-8 text-crys-gold" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-crys-charcoal border-crys-graphite">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-crys-light-grey text-sm">Total Comments</p>
                <p className="text-2xl font-bold text-crys-white">{analytics.total_comments}</p>
              </div>
              <Reply className="w-8 h-8 text-crys-gold" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-crys-charcoal border-crys-graphite">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-crys-light-grey text-sm">Active Users</p>
                <p className="text-2xl font-bold text-crys-white">{analytics.total_users}</p>
              </div>
              <Users className="w-8 h-8 text-crys-gold" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-crys-charcoal border-crys-graphite">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-crys-light-grey text-sm">Popular Tags</p>
                <p className="text-2xl font-bold text-crys-white">{analytics.popular_tags.length}</p>
              </div>
              <Tag className="w-8 h-8 text-crys-gold" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Most Active Users */}
        <Card className="bg-crys-charcoal border-crys-graphite">
          <CardHeader>
            <CardTitle className="text-crys-white flex items-center gap-2">
              <Award className="w-5 h-5 text-crys-gold" />
              Most Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.most_active_users.slice(0, 10).map((user, index) => (
                <div key={user.user_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-crys-gold/20 rounded-full flex items-center justify-center">
                      <span className="text-crys-gold font-bold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-crys-white font-medium">User {user.user_id.slice(-4)}</p>
                      <p className="text-crys-light-grey text-sm">{user.activity} activities</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-crys-gold/20 text-crys-gold">
                    {user.activity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Popular Categories */}
        <Card className="bg-crys-charcoal border-crys-graphite">
          <CardHeader>
            <CardTitle className="text-crys-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-crys-gold" />
              Popular Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.popular_categories.map((category, index) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-crys-gold/20 rounded-full flex items-center justify-center">
                      <span className="text-crys-gold font-bold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-crys-white font-medium capitalize">{category.category}</p>
                      <p className="text-crys-light-grey text-sm">{category.count} posts</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-crys-gold/20 text-crys-gold">
                    {category.count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Popular Tags */}
        <Card className="bg-crys-charcoal border-crys-graphite">
          <CardHeader>
            <CardTitle className="text-crys-white flex items-center gap-2">
              <Tag className="w-5 h-5 text-crys-gold" />
              Popular Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analytics.popular_tags.slice(0, 20).map((tag, index) => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className="border-crys-graphite text-crys-light-grey hover:border-crys-gold hover:text-crys-gold transition-colors"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Engagement Stats */}
        <Card className="bg-crys-charcoal border-crys-graphite">
          <CardHeader>
            <CardTitle className="text-crys-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-crys-gold" />
              Engagement Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-crys-light-grey">Posts per User</span>
                <span className="text-crys-white font-semibold">
                  {analytics.total_users > 0 ? (analytics.total_posts / analytics.total_users).toFixed(1) : '0'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-crys-light-grey">Comments per Post</span>
                <span className="text-crys-white font-semibold">
                  {analytics.total_posts > 0 ? (analytics.total_comments / analytics.total_posts).toFixed(1) : '0'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-crys-light-grey">Most Active Category</span>
                <span className="text-crys-white font-semibold capitalize">
                  {analytics.popular_categories[0]?.category || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-crys-light-grey">Total Tags</span>
                <span className="text-crys-white font-semibold">
                  {analytics.popular_tags.length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

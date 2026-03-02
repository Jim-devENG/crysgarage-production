import React, { useState, useEffect } from 'react';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalFiles: number;
  totalCredits: number;
  storageUsed: number;
  processedFiles: number;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  user?: string;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalFiles: 0,
    totalCredits: 0,
    storageUsed: 0,
    processedFiles: 0,
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load real data from Firebase and APIs
    const loadData = async () => {
      try {
        let realStats = {
          totalUsers: 0,
          activeUsers: 0,
          totalFiles: 0,
          totalCredits: 0,
          storageUsed: 0,
          processedFiles: 0,
        };

        // Load users from API
        try {
          const usersResponse = await fetch('https://crysgarage.studio/api/v1/users');
          if (usersResponse.ok) {
            const usersData = await usersResponse.json();
            realStats.totalUsers = usersData.length || 0;
            realStats.activeUsers = usersData.filter((user: any) => user.is_active).length || 0;
            console.log('API users loaded:', realStats.totalUsers, 'Active:', realStats.activeUsers);
          }
        } catch (error) {
          console.error('Users API error:', error);
        }

        // Load files data from backend API
        try {
          const filesResponse = await fetch('https://crysgarage.studio/api/v1/masters');
          if (filesResponse.ok) {
            const filesData = await filesResponse.json();
            realStats.totalFiles = filesData.length || 0;
            realStats.processedFiles = filesData.filter((file: any) => file.is_processed).length || 0;
      }
    } catch (error) {
          console.error('Files API error:', error);
        }

        // Load credits data from backend API
        try {
          const creditsResponse = await fetch('https://crysgarage.studio/credits');
          if (creditsResponse.ok) {
            const creditsData = await creditsResponse.json();
            realStats.totalCredits = creditsData.total_credits || creditsData.balance || 0;
      }
    } catch (error) {
          console.error('Credits API error:', error);
        }

        // Load storage data from backend API
        try {
          const storageResponse = await fetch('https://crysgarage.studio/api/v1/metrics');
          if (storageResponse.ok) {
            const storageData = await storageResponse.json();
            realStats.storageUsed = storageData.total_size_mb / 1024 || 0; // Convert MB to GB
      }
    } catch (error) {
          console.error('Storage API error:', error);
        }

        setStats(realStats);

        // Load recent activity from API or use mock data
        try {
          const activityResponse = await fetch('https://crysgarage.studio/api/v1/activity');
          if (activityResponse.ok) {
            const activities = await activityResponse.json();
            setRecentActivity(activities);
          } else {
            // Fallback to mock recent activity
            setRecentActivity([
              {
                id: '1',
                type: 'user',
                description: 'New user registration',
                timestamp: new Date(Date.now() - 2 * 60 * 1000),
                user: 'user@example.com'
              },
              {
                id: '2',
                type: 'file',
                description: 'Audio file processed',
                timestamp: new Date(Date.now() - 5 * 60 * 1000),
                user: 'artist@example.com'
              },
              {
                id: '3',
                type: 'credit',
                description: 'Credit purchase completed',
                timestamp: new Date(Date.now() - 12 * 60 * 1000),
                user: 'producer@example.com'
              }
            ]);
          }
        } catch (activityError) {
          console.error('Activity loading error:', activityError);
          // Fallback to mock recent activity
          setRecentActivity([
            {
              id: '1',
              type: 'user',
              description: 'New user registration',
              timestamp: new Date(Date.now() - 2 * 60 * 1000),
              user: 'user@example.com'
            },
            {
              id: '2',
              type: 'file',
              description: 'Audio file processed',
              timestamp: new Date(Date.now() - 5 * 60 * 1000),
              user: 'artist@example.com'
            },
            {
              id: '3',
              type: 'credit',
              description: 'Credit purchase completed',
              timestamp: new Date(Date.now() - 12 * 60 * 1000),
              user: 'producer@example.com'
            }
          ]);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading admin data:', error);
        setLoading(false);
      }
    };

    loadData();

    // Set up real-time updates every 15 seconds for live data
    const interval = setInterval(loadData, 15000);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatStorage = (gb: number) => {
    return `${gb.toFixed(1)} GB`;
  };

  if (loading) {
  return (
      <div className="min-h-screen bg-crys-black text-crys-white p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crys-gold mx-auto mb-4"></div>
            <p className="text-crys-light-grey">Loading admin data...</p>
            </div>
          </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-crys-black text-crys-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-crys-gold mb-8">Admin Dashboard</h1>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-crys-charcoal p-6 rounded-lg border border-crys-graphite">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-crys-gold font-semibold text-lg">Total Users</h3>
                <p className="text-3xl font-bold text-crys-white">{formatNumber(stats.totalUsers)}</p>
      </div>
              <div className="text-crys-gold text-2xl">👥</div>
        </div>
      </div>

          <div className="bg-crys-charcoal p-6 rounded-lg border border-crys-graphite">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-crys-gold font-semibold text-lg">Active Users</h3>
                <p className="text-3xl font-bold text-crys-white">{formatNumber(stats.activeUsers)}</p>
        </div>
              <div className="text-crys-gold text-2xl">🟢</div>
                </div>
              </div>

          <div className="bg-crys-charcoal p-6 rounded-lg border border-crys-graphite">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-crys-gold font-semibold text-lg">Audio Files</h3>
                <p className="text-3xl font-bold text-crys-white">{formatNumber(stats.totalFiles)}</p>
                  </div>
              <div className="text-crys-gold text-2xl">🎵</div>
                </div>
              </div>

          <div className="bg-crys-charcoal p-6 rounded-lg border border-crys-graphite">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-crys-gold font-semibold text-lg">Total Credits</h3>
                <p className="text-3xl font-bold text-crys-white">{formatNumber(stats.totalCredits)}</p>
                  </div>
              <div className="text-crys-gold text-2xl">💰</div>
                </div>
              </div>

          <div className="bg-crys-charcoal p-6 rounded-lg border border-crys-graphite">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-crys-gold font-semibold text-lg">Storage Used</h3>
                <p className="text-3xl font-bold text-crys-white">{formatStorage(stats.storageUsed)}</p>
                  </div>
              <div className="text-crys-gold text-2xl">💾</div>
              </div>
            </div>

          <div className="bg-crys-charcoal p-6 rounded-lg border border-crys-graphite">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-crys-gold font-semibold text-lg">Processed Files</h3>
                <p className="text-3xl font-bold text-crys-white">{formatNumber(stats.processedFiles)}</p>
                  </div>
              <div className="text-crys-gold text-2xl">✅</div>
                </div>
              </div>
            </div>

        {/* Recent Activity */}
        <div className="bg-crys-charcoal p-6 rounded-lg border border-crys-graphite mb-8">
          <h2 className="text-2xl font-bold text-crys-gold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={activity.id} className={`flex items-center justify-between py-2 ${index < recentActivity.length - 1 ? 'border-b border-crys-graphite' : ''}`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-crys-gold rounded-full"></div>
                    <span className="text-crys-white">{activity.description}</span>
                    {activity.user && (
                      <span className="text-crys-graphite text-sm">({activity.user})</span>
                    )}
                  </div>
                  <span className="text-crys-gold text-sm">
                    {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Just now'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-crys-graphite text-center py-4">No recent activity</div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
        <div className="bg-crys-charcoal p-6 rounded-lg border border-crys-graphite">
          <h2 className="text-2xl font-bold text-crys-gold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-crys-gold text-crys-black px-6 py-3 rounded hover:bg-crys-gold-muted transition-colors font-semibold">
              View All Users
                  </button>
            <button className="bg-crys-graphite text-crys-white px-6 py-3 rounded hover:bg-crys-gold hover:text-crys-black transition-colors font-semibold">
              Manage Files
                  </button>
            <button className="bg-crys-graphite text-crys-white px-6 py-3 rounded hover:bg-crys-gold hover:text-crys-black transition-colors font-semibold">
              System Settings
                    </button>
                  </div>
                </div>
      </div>
    </div>
  );
}; 
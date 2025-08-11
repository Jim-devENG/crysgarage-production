import React, { useState, useEffect } from 'react';

interface AdminDashboardProps {
  onBack: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);

  // Real-time data states
  const [systemStats, setSystemStats] = useState({
    totalUsers: 156,
    totalFiles: 1247,
    inQueue: 0,
    revenue: 2847,
    activeUsers: 142,
    premiumUsers: 89,
    suspendedUsers: 3,
    processedFiles: 1189,
    storageUsed: 45,
    cpuUsage: 30,
    memoryUsage: 45,
    diskUsage: 28,
    networkTraffic: 800
  });

  const [processingQueue, setProcessingQueue] = useState([]);

  const [users, setUsers] = useState([
    {
      id: '12345',
      name: 'John Doe',
      email: 'john@example.com',
      tier: 'Professional',
      status: 'Active',
      files: 15,
      spent: 247,
      lastActive: '2 hours ago',
      avatar: 'J'
    },
    {
      id: '12346',
      name: 'Sarah Smith',
      email: 'sarah@example.com',
      tier: 'Advanced',
      status: 'Active',
      files: 32,
      spent: 892,
      lastActive: '1 day ago',
      avatar: 'S'
    }
  ]);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'success',
      message: 'File "afrobeats_mix_001.wav" completed processing',
      time: '2 minutes ago'
    },
    {
      id: 2,
      type: 'info',
      message: 'New user registered: Mike Johnson',
      time: '5 minutes ago'
    }
  ]);

  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Pagination state for processing queue
  const [currentPage, setCurrentPage] = useState(1);
  const filesPerPage = 5; // Show 5 files per page

  // Counter for generating readable file IDs
  const [fileIdCounter, setFileIdCounter] = useState(1001);

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      
      // Update processing queue progress with realistic file processing
      setProcessingQueue(prev => prev.map(file => {
        if (file.status === 'processing' && file.progress < 100) {
          // Realistic processing speed based on file size and tier
          const processingSpeed = file.tier === 'Advanced' ? 8 : file.tier === 'Professional' ? 5 : 3;
          const newProgress = Math.min(file.progress + processingSpeed, 100);
          
          // Calculate realistic time remaining
          let timeLeft = '';
          if (newProgress >= 100) {
            timeLeft = 'Completing...';
            // Add completion notification
            const newNotification = {
              id: Date.now(),
              type: 'success',
              message: `File "${file.fileName}" completed processing`,
              time: 'Just now'
            };
            setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
          } else {
            const remainingPercent = 100 - newProgress;
            const estimatedMinutes = Math.ceil(remainingPercent / processingSpeed);
            timeLeft = `${estimatedMinutes} min left`;
          }
          
          return {
            ...file,
            progress: newProgress,
            timeLeft: timeLeft,
            status: newProgress >= 100 ? 'completed' : 'processing'
          };
        }
        return file;
      }));

      // Add new files to queue occasionally
      if (Math.random() < 0.3) { // 30% chance every 3 seconds
        const newFiles = [
          'afrobeats_mix_003.wav',
          'hiphop_track_004.wav', 
          'reggae_vibes_005.wav',
          'electronic_beats_006.wav',
          'jazz_fusion_007.wav',
          'rock_anthem_008.wav',
          'pop_hit_009.wav',
          'classical_symphony_010.wav'
        ];
        const randomFile = newFiles[Math.floor(Math.random() * newFiles.length)];
        const tiers = ['Free', 'Professional', 'Advanced'];
        const randomTier = tiers[Math.floor(Math.random() * tiers.length)];
        const owners = ['Mike Johnson', 'Lisa Chen', 'David Wilson', 'Emma Rodriguez', 'Alex Thompson', 'Maria Garcia'];
        const randomOwner = owners[Math.floor(Math.random() * owners.length)];
        
        const newFile = {
          id: fileIdCounter,
          fileName: randomFile,
          owner: randomOwner,
          tier: randomTier,
          progress: 0,
          timeLeft: '~10 min wait',
          status: 'queued'
        };
        
        setProcessingQueue(prev => [...prev, newFile]);
        setFileIdCounter(prev => prev + 1);
        setSystemStats(prev => ({ 
          ...prev, 
          totalFiles: prev.totalFiles + 1,
          inQueue: prev.inQueue + 1
        }));

        // Add new file notification
        const newNotification = {
          id: Date.now() + 1,
          type: 'info',
          message: `New file uploaded: ${randomFile} by ${randomOwner}`,
          time: 'Just now'
        };
        setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
      }

      // Complete files and remove from queue
      setProcessingQueue(prev => {
        const completedFiles = prev.filter(file => file.progress >= 100);
        if (completedFiles.length > 0) {
          setSystemStats(prev => ({ 
            ...prev, 
            processedFiles: prev.processedFiles + completedFiles.length,
            inQueue: Math.max(0, prev.inQueue - completedFiles.length)
          }));
        }
        return prev.filter(file => file.progress < 100);
      });

      // Update system stats with realistic patterns
      setSystemStats(prev => {
        const now = new Date();
        const hour = now.getHours();
        
        // Simulate realistic user activity patterns (more active during day)
        const activityMultiplier = hour >= 9 && hour <= 18 ? 1.5 : hour >= 19 && hour <= 23 ? 1.2 : 0.3;
        
        // Realistic revenue growth based on processing activity
        const revenueIncrease = Math.floor(Math.random() * 5) + 1; // $1-5 per update
        
        // CPU usage based on processing load
        const baseCpuUsage = 30;
        const processingLoad = prev.inQueue * 2;
        const newCpuUsage = Math.min(90, Math.max(20, baseCpuUsage + processingLoad + (Math.random() - 0.5) * 10));
        
        // Memory usage correlates with CPU
        const newMemoryUsage = Math.min(85, Math.max(30, newCpuUsage + (Math.random() - 0.5) * 15));
        
        // Disk usage grows slowly with processed files
        const newDiskUsage = Math.min(75, Math.max(25, prev.diskUsage + (Math.random() * 0.1)));
        
        // Network traffic based on active processing
        const baseNetwork = 800;
        const processingTraffic = prev.inQueue * 50;
        const newNetworkTraffic = Math.max(800, Math.min(2000, baseNetwork + processingTraffic + (Math.random() - 0.5) * 100));
        
        // Add new user occasionally
        const newUser = Math.random() < 0.1;
        if (newUser) {
          const newNotification = {
            id: Date.now() + 2,
            type: 'info',
            message: 'New user registered',
            time: 'Just now'
          };
          setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
        }
        
        return {
          ...prev,
          totalUsers: prev.totalUsers + (newUser ? 1 : 0),
          totalFiles: prev.totalFiles + (Math.random() < 0.2 ? 1 : 0),
          revenue: prev.revenue + revenueIncrease,
          activeUsers: Math.max(prev.activeUsers - 1, Math.min(prev.activeUsers + 1, prev.totalUsers)),
          cpuUsage: newCpuUsage,
          memoryUsage: newMemoryUsage,
          diskUsage: newDiskUsage,
          networkTraffic: newNetworkTraffic
        };
      });

      // Update user activity
      setUsers(prev => prev.map(user => {
        const lastActiveHours = Math.floor(Math.random() * 24);
        let lastActive = '';
        if (lastActiveHours === 0) {
          lastActive = 'Just now';
        } else if (lastActiveHours === 1) {
          lastActive = '1 hour ago';
        } else if (lastActiveHours < 24) {
          lastActive = `${lastActiveHours} hours ago`;
        } else {
          const days = Math.floor(lastActiveHours / 24);
          lastActive = `${days} day${days > 1 ? 's' : ''} ago`;
        }
        
        return {
          ...user,
          lastActive: lastActive,
          files: user.files + (Math.random() < 0.05 ? 1 : 0),
          spent: user.spent + (Math.random() < 0.03 ? Math.floor(Math.random() * 10) + 1 : 0)
        };
      }));

      // Update notification times
      setNotifications(prev => prev.map(notification => {
        const timeAgo = Math.floor(Math.random() * 10) + 1;
        let time = '';
        if (timeAgo === 1) {
          time = '1 minute ago';
        } else if (timeAgo < 60) {
          time = `${timeAgo} minutes ago`;
        } else {
          const hours = Math.floor(timeAgo / 60);
          time = `${hours} hour${hours > 1 ? 's' : ''} ago`;
        }
        return { ...notification, time };
      }));

    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const handleTabChange = (tabName: string) => {
    console.log('Switching to tab:', tabName);
    setActiveTab(tabName);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-crys-black via-crys-graphite to-crys-black">
      {/* Header */}
      <div className="bg-audio-panel-bg border-b border-audio-panel-border shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-crys-white">Crys Garage Admin</h1>
              <p className="text-crys-light-grey">Audio Mastering Platform Dashboard</p>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={onBack}
                className="bg-crys-gold text-crys-black px-6 py-2 rounded-lg hover:bg-crys-gold/90 transition-colors font-semibold"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-audio-panel-bg border-b border-audio-panel-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            <button
              onClick={() => handleTabChange('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === 'overview'
                  ? 'border-crys-gold text-crys-gold'
                  : 'border-transparent text-crys-light-grey hover:text-crys-white hover:border-crys-gold/50'
              }`}
            >
              <span className="text-lg">📊</span>
              <span>Overview</span>
            </button>
            <button
              onClick={() => handleTabChange('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === 'users'
                  ? 'border-crys-gold text-crys-gold'
                  : 'border-transparent text-crys-light-grey hover:text-crys-white hover:border-crys-gold/50'
              }`}
            >
              <span className="text-lg">👥</span>
              <span>User Management</span>
            </button>
            <button
              onClick={() => handleTabChange('content')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === 'content'
                  ? 'border-crys-gold text-crys-gold'
                  : 'border-transparent text-crys-light-grey hover:text-crys-white hover:border-crys-gold/50'
              }`}
            >
              <span className="text-lg">📁</span>
              <span>Content Management</span>
            </button>
            <button
              onClick={() => handleTabChange('system')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === 'system'
                  ? 'border-crys-gold text-crys-gold'
                  : 'border-transparent text-crys-light-grey hover:text-crys-white hover:border-crys-gold/50'
              }`}
            >
              <span className="text-lg">⚙️</span>
              <span>System Settings</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Debug Info */}
        <div className="mb-4 bg-crys-gold/10 p-4 rounded-lg text-crys-gold text-lg font-bold border-2 border-crys-gold/30">
          🔍 DEBUG: Current active tab is: {activeTab}
        </div>
        
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-audio-panel-bg border border-audio-panel-border rounded-lg shadow-lg p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-crys-gold/20">
                    <span className="text-crys-gold text-xl">👥</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-crys-light-grey">Total Users</p>
                    <p className="text-2xl font-semibold text-crys-white">{systemStats.totalUsers}</p>
                    <p className="text-xs text-crys-gold">+12% this month</p>
                  </div>
                </div>
              </div>

              <div className="bg-audio-panel-bg border border-audio-panel-border rounded-lg shadow-lg p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-crys-gold/20">
                    <span className="text-crys-gold text-xl">🎵</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-crys-light-grey">Files Processed</p>
                    <p className="text-2xl font-semibold text-crys-white">{systemStats.totalFiles}</p>
                    <p className="text-xs text-crys-gold">+8% this week</p>
                  </div>
                </div>
              </div>

              <div className="bg-audio-panel-bg border border-audio-panel-border rounded-lg shadow-lg p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-crys-gold/20">
                    <span className="text-crys-gold text-xl">⏱️</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-crys-light-grey">In Queue</p>
                    <p className="text-2xl font-semibold text-crys-white">{systemStats.inQueue}</p>
                    <p className="text-xs text-crys-gold">Avg: 15 min</p>
                  </div>
                </div>
              </div>

              <div className="bg-audio-panel-bg border border-audio-panel-border rounded-lg shadow-lg p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-crys-gold/20">
                    <span className="text-crys-gold text-xl">💰</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-crys-light-grey">Revenue</p>
                    <p className="text-2xl font-semibold text-crys-white">${systemStats.revenue}</p>
                    <p className="text-xs text-crys-gold">+23% this month</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Audio Processing Queue */}
            <div className="bg-audio-panel-bg border border-audio-panel-border rounded-lg shadow-lg">
              <div className="px-6 py-4 border-b border-audio-panel-border">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-crys-white">Processing Queue</h3>
                  <span className="text-sm text-crys-light-grey">
                    {processingQueue.length} files • Page {currentPage} of {Math.ceil(processingQueue.length / filesPerPage) || 1}
                  </span>
                </div>
              </div>
              <div className="p-6">
                {processingQueue.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-crys-light-grey">No files currently in queue</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {processingQueue
                        .slice((currentPage - 1) * filesPerPage, currentPage * filesPerPage)
                        .map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-4 bg-crys-gold/5 rounded-lg border border-crys-gold/20">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-crys-gold rounded-full flex items-center justify-center">
                              <span className="text-crys-black text-sm font-semibold">{file.id}</span>
                            </div>
                            <div>
                              <p className="font-medium text-crys-white">{file.fileName}</p>
                              <p className="text-sm text-crys-light-grey">{file.owner} • {file.tier} Tier</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="w-32 bg-crys-graphite rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${file.status === 'processing' ? 'bg-crys-gold' : 'bg-crys-light-grey'}`} 
                                style={{ width: `${file.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-crys-light-grey">{file.progress}%</span>
                            <span className="text-sm text-crys-gold">{file.timeLeft}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Pagination Controls */}
                    {processingQueue.length > filesPerPage && (
                      <div className="mt-6 flex justify-center items-center space-x-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            currentPage === 1
                              ? 'text-crys-light-grey cursor-not-allowed'
                              : 'text-crys-gold hover:bg-crys-gold/10'
                          }`}
                        >
                          ← Previous
                        </button>
                        
                        <div className="flex space-x-1">
                          {Array.from({ length: Math.ceil(processingQueue.length / filesPerPage) }, (_, i) => i + 1).map(pageNum => (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                currentPage === pageNum
                                  ? 'bg-crys-gold text-crys-black'
                                  : 'text-crys-light-grey hover:bg-crys-gold/10'
                              }`}
                            >
                              {pageNum}
                            </button>
                          ))}
                        </div>
                        
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(Math.ceil(processingQueue.length / filesPerPage), prev + 1))}
                          disabled={currentPage === Math.ceil(processingQueue.length / filesPerPage)}
                          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            currentPage === Math.ceil(processingQueue.length / filesPerPage)
                              ? 'text-crys-light-grey cursor-not-allowed'
                              : 'text-crys-gold hover:bg-crys-gold/10'
                          }`}
                        >
                          Next →
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-audio-panel-bg border border-audio-panel-border rounded-lg shadow-lg">
              <div className="px-6 py-4 border-b border-audio-panel-border">
                <h3 className="text-lg font-medium text-crys-white">Quick Actions</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button 
                    onClick={() => alert('Processing new files...')}
                    className="flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-crys-black bg-crys-gold hover:bg-crys-gold/90 transition-colors font-semibold"
                  >
                    <span className="mr-2">📤</span>
                    Process New Files
                  </button>
                  <button 
                    onClick={() => alert('Adding new client...')}
                    className="flex items-center justify-center px-4 py-3 border border-crys-gold rounded-md shadow-sm text-sm font-medium text-crys-gold hover:bg-crys-gold/10 transition-colors font-semibold"
                  >
                    <span className="mr-2">👥</span>
                    Add New Client
                  </button>
                  <button 
                    onClick={() => alert('Opening analytics...')}
                    className="flex items-center justify-center px-4 py-3 border border-crys-gold rounded-md shadow-sm text-sm font-medium text-crys-gold hover:bg-crys-gold/10 transition-colors font-semibold"
                  >
                    <span className="mr-2">📊</span>
                    View Analytics
                  </button>
                </div>
              </div>
            </div>

            {/* Live Notifications */}
            <div className="bg-audio-panel-bg border border-audio-panel-border rounded-lg shadow-lg">
              <div className="px-6 py-4 border-b border-audio-panel-border">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-crys-white">Live Notifications</h3>
                  <span className="text-xs text-crys-gold">Last updated: {lastUpdate.toLocaleTimeString()}</span>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div key={notification.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                      notification.type === 'success' 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : notification.type === 'warning'
                        ? 'bg-yellow-500/10 border-yellow-500/30'
                        : 'bg-blue-500/10 border-blue-500/30'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <span className={`text-lg ${
                          notification.type === 'success' ? 'text-green-400' : 
                          notification.type === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                        }`}>
                          {notification.type === 'success' ? '✅' : 
                           notification.type === 'warning' ? '⚠️' : 'ℹ️'}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-crys-white">{notification.message}</p>
                          <p className="text-xs text-crys-light-grey">{notification.time}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                        className="text-crys-light-grey hover:text-crys-white text-sm"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-crys-light-grey">No recent notifications</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-audio-panel-bg border border-audio-panel-border rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-crys-white">User Management</h2>
              <p className="text-crys-light-grey mb-4">This is the user management tab. You should see this when the users tab is active.</p>
              <button className="mt-4 bg-crys-gold text-crys-black px-4 py-2 rounded hover:bg-crys-gold/90 font-semibold">
                Add New User
              </button>
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="bg-audio-panel-bg border border-audio-panel-border rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-crys-white">Content Management</h2>
              <p className="text-crys-light-grey mb-4">This is the content management tab. You should see this when the content tab is active.</p>
              <button className="mt-4 bg-crys-gold text-crys-black px-4 py-2 rounded hover:bg-crys-gold/90 font-semibold">
                Upload File
              </button>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-6">
            {/* System Health Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-audio-panel-bg border border-audio-panel-border rounded-lg shadow-lg">
                <div className="px-6 py-4 border-b border-audio-panel-border">
                  <h3 className="text-lg font-medium text-crys-white">System Health</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-crys-light-grey">Frontend Container</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-crys-gold/20 text-crys-gold border border-crys-gold/30">
                        ✅ Healthy
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-crys-light-grey">Backend Container</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-crys-gold/20 text-crys-gold border border-crys-gold/30">
                        ✅ Healthy
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-crys-light-grey">Ruby Service</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-crys-gold/20 text-crys-gold border border-crys-gold/30">
                        ✅ Healthy
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-crys-light-grey">Nginx Proxy</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-crys-gold/20 text-crys-gold border border-crys-gold/30">
                        ✅ Healthy
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-audio-panel-bg border border-audio-panel-border rounded-lg shadow-lg">
                <div className="px-6 py-4 border-b border-audio-panel-border">
                  <h3 className="text-lg font-medium text-crys-white">Resource Usage</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span className="text-crys-light-grey">CPU Usage</span>
                        <span className="text-crys-white">{Math.round(systemStats.cpuUsage)}%</span>
                      </div>
                      <div className="mt-2 bg-crys-graphite rounded-full h-2">
                        <div className="bg-crys-gold h-2 rounded-full" style={{ width: `${systemStats.cpuUsage}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span className="text-crys-light-grey">Memory Usage</span>
                        <span className="text-crys-white">{Math.round(systemStats.memoryUsage)}%</span>
                      </div>
                      <div className="mt-2 bg-crys-graphite rounded-full h-2">
                        <div className="bg-crys-gold h-2 rounded-full" style={{ width: `${systemStats.memoryUsage}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span className="text-crys-light-grey">Disk Usage</span>
                        <span className="text-crys-white">{Math.round(systemStats.diskUsage)}%</span>
                      </div>
                      <div className="mt-2 bg-crys-graphite rounded-full h-2">
                        <div className="bg-crys-gold h-2 rounded-full" style={{ width: `${systemStats.diskUsage}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span className="text-crys-light-grey">Network Traffic</span>
                        <span className="text-crys-white">{Math.round(systemStats.networkTraffic)} MB/s</span>
                      </div>
                      <div className="mt-2 bg-crys-graphite rounded-full h-2">
                        <div className="bg-crys-gold h-2 rounded-full" style={{ width: `${(systemStats.networkTraffic / 2000) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* System Settings */}
            <div className="bg-audio-panel-bg border border-audio-panel-border rounded-lg shadow-lg">
              <div className="px-6 py-4 border-b border-audio-panel-border">
                <h3 className="text-lg font-medium text-crys-white">System Configuration</h3>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-md font-medium text-crys-white mb-4">General Settings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-crys-light-grey mb-2">Site Name</label>
                        <input type="text" className="w-full px-3 py-2 border border-audio-panel-border rounded-md bg-crys-graphite text-crys-white focus:border-crys-gold focus:outline-none" defaultValue="Crys Garage" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-crys-light-grey mb-2">Admin Email</label>
                        <input type="email" className="w-full px-3 py-2 border border-audio-panel-border rounded-md bg-crys-graphite text-crys-white focus:border-crys-gold focus:outline-none" defaultValue="admin@crysgarage.studio" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-md font-medium text-crys-white mb-4">Audio Processing Settings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-crys-light-grey mb-2">Max File Size (MB)</label>
                        <input type="number" className="w-full px-3 py-2 border border-audio-panel-border rounded-md bg-crys-graphite text-crys-white focus:border-crys-gold focus:outline-none" defaultValue="100" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-crys-light-grey mb-2">Processing Timeout (min)</label>
                        <input type="number" className="w-full px-3 py-2 border border-audio-panel-border rounded-md bg-crys-graphite text-crys-white focus:border-crys-gold focus:outline-none" defaultValue="30" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-crys-light-grey mb-2">Concurrent Jobs</label>
                        <input type="number" className="w-full px-3 py-2 border border-audio-panel-border rounded-md bg-crys-graphite text-crys-white focus:border-crys-gold focus:outline-none" defaultValue="5" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button className="px-4 py-2 border border-audio-panel-border rounded-md text-crys-light-grey hover:bg-crys-graphite transition-colors">
                      Cancel
                    </button>
                    <button 
                      onClick={() => alert('Settings saved successfully!')}
                      className="px-4 py-2 bg-crys-gold text-crys-black rounded-md hover:bg-crys-gold/90 font-semibold"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  Typography, 
  Grid, 
  Box, 
  Chip,
  LinearProgress,
  Alert,
  CircularProgress
} from '@mui/material';
import { useGetList } from 'react-admin';
// Real-time data simulation
import {
  People as PeopleIcon,
  MusicNote as MusicIcon,
  Storage as StorageIcon,
  Security as SecurityIcon,
  AttachMoney as MoneyIcon,
  Folder as FolderIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

const StatCard = ({ title, value, icon, color }: any) => (
  <Card>
    <CardHeader
      avatar={React.createElement(icon, { sx: { color } })}
      title={title}
    />
    <CardContent>
      <Typography variant="h4" component="div">
        {value}
      </Typography>
    </CardContent>
  </Card>
);

export const Dashboard = () => {
  const [realTimeStats, setRealTimeStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalFiles: 0,
    totalCredits: 0,
    storageUsed: 0,
    processedFiles: 0,
    registeredIPs: 0,
    recentActivity: 0,
  });

  const { data: users, total: usersTotal } = useGetList('users', {
    pagination: { page: 1, perPage: 1 },
  });
  
  const { data: audioFiles, total: audioFilesTotal } = useGetList('audio-files', {
    pagination: { page: 1, perPage: 1 },
  });
  
  const { data: credits, total: creditsTotal } = useGetList('credits', {
    pagination: { page: 1, perPage: 1 },
  });
  
  const { data: storageStats } = useGetList('storage-stats');
  const { data: processedFiles } = useGetList('processed-files');
  const { data: ipTracking } = useGetList('ip-tracking');

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setRealTimeStats(prev => ({
        totalUsers: prev.totalUsers + Math.floor(Math.random() * 2),
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 1),
        totalFiles: prev.totalFiles + Math.floor(Math.random() * 3),
        totalCredits: prev.totalCredits + Math.floor(Math.random() * 50),
        storageUsed: prev.storageUsed + Math.floor(Math.random() * 1000000),
        processedFiles: prev.processedFiles + Math.floor(Math.random() * 2),
        registeredIPs: prev.registeredIPs + Math.floor(Math.random() * 1),
        recentActivity: prev.recentActivity + Math.floor(Math.random() * 5),
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Crys Garage Admin Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={realTimeStats.totalUsers + (usersTotal || 0)}
            icon={PeopleIcon}
            color="primary"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Users"
            value={realTimeStats.activeUsers}
            icon={TrendingUpIcon}
            color="success"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Audio Files"
            value={realTimeStats.totalFiles + (audioFilesTotal || 0)}
            icon={MusicIcon}
            color="secondary"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Credits"
            value={realTimeStats.totalCredits + (creditsTotal || 0)}
            icon={MoneyIcon}
            color="success"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Storage Used"
            value={((realTimeStats.storageUsed + (storageStats?.[0]?.total_size_mb || 0)) / 1024).toFixed(2) + ' GB'}
            icon={StorageIcon}
            color="warning"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Processed Files"
            value={realTimeStats.processedFiles + (processedFiles?.[0]?.total_files || 0)}
            icon={FolderIcon}
            color="info"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Registered IPs"
            value={realTimeStats.registeredIPs + (ipTracking?.[0]?.total_registered_ips || 0)}
            icon={SecurityIcon}
            color="error"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Recent Activity"
            value={realTimeStats.recentActivity}
            icon={ScheduleIcon}
            color="info"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

import React from 'react';
import { Card, CardContent, CardHeader, Typography, Grid, Box } from '@mui/material';
import { useGetList } from 'react-admin';
import {
  People as PeopleIcon,
  MusicNote as MusicIcon,
  Storage as StorageIcon,
  Security as SecurityIcon,
  AttachMoney as MoneyIcon,
  Folder as FolderIcon,
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

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Crys Garage Admin Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={usersTotal || 0}
            icon={PeopleIcon}
            color="primary"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Audio Files"
            value={audioFilesTotal || 0}
            icon={MusicIcon}
            color="secondary"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Credits"
            value={creditsTotal || 0}
            icon={MoneyIcon}
            color="success"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Storage Used"
            value={storageStats?.[0]?.total_size_mb?.toFixed(2) + ' MB' || '0 MB'}
            icon={StorageIcon}
            color="warning"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Processed Files"
            value={processedFiles?.[0]?.total_files || 0}
            icon={FolderIcon}
            color="info"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Registered IPs"
            value={ipTracking?.[0]?.total_registered_ips || 0}
            icon={SecurityIcon}
            color="error"
          />
        </Grid>
      </Grid>
    </Box>
  );
};


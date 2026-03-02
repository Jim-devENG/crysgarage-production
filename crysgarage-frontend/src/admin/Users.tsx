import React, { useState, useEffect } from 'react';
import {
  List,
  Datagrid,
  TextField,
  EmailField,
  DateField,
  Edit,
  SimpleForm,
  TextInput,
  Create,
  Show,
  SimpleShowLayout,
  NumberField,
  BooleanField,
  ChipField,
  FunctionField,
  TopToolbar,
  CreateButton,
  ExportButton,
  RefreshButton,
  useNotify,
  useRefresh,
} from 'react-admin';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Chip,
  LinearProgress,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Star as StarIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

const ListActions = (props: any) => (
  <TopToolbar>
    <CreateButton />
    <ExportButton />
    <RefreshButton />
  </TopToolbar>
);

const TierChip = ({ record }: any) => {
  const getTierColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'free': return 'default';
      case 'professional': return 'primary';
      case 'advanced': return 'secondary';
      case 'developer': return 'success';
      default: return 'default';
    }
  };

  return (
    <Chip 
      label={record?.tier || 'Unknown'} 
      color={getTierColor(record?.tier)} 
      size="small"
    />
  );
};

const StatusChip = ({ record }: any) => {
  const isActive = record?.is_active;
  return (
    <Chip
      icon={isActive ? <CheckCircleIcon /> : <CancelIcon />}
      label={isActive ? 'Active' : 'Inactive'}
      color={isActive ? 'success' : 'error'}
      size="small"
    />
  );
};

const CreditsField = ({ record }: any) => {
  const credits = record?.credits || 0;
  const isUnlimited = credits === Infinity || credits === Number.POSITIVE_INFINITY;
  
  return (
    <Box display="flex" alignItems="center" gap={1}>
      <MoneyIcon fontSize="small" color="primary" />
      <Typography variant="body2">
        {isUnlimited ? '∞' : credits.toLocaleString()}
      </Typography>
    </Box>
  );
};

const LastActivityField = ({ record }: any) => {
  const lastActivity = record?.last_login || record?.updatedAt;
  const now = new Date();
  const activityDate = new Date(lastActivity);
  const diffHours = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60));
  
  const getActivityColor = (hours: number) => {
    if (hours < 24) return 'success';
    if (hours < 168) return 'warning'; // 1 week
    return 'error';
  };

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <ScheduleIcon fontSize="small" />
      <Chip
        label={diffHours < 24 ? `${diffHours}h ago` : `${Math.floor(diffHours / 24)}d ago`}
        color={getActivityColor(diffHours)}
        size="small"
      />
    </Box>
  );
};

export const UsersList = (props: any) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalCredits: 0,
    recentSignups: 0,
  });
  const [loading, setLoading] = useState(true);
  const refresh = useRefresh();

  useEffect(() => {
    // Simulate real-time stats update
    const interval = setInterval(() => {
      setStats(prev => ({
        totalUsers: prev.totalUsers + Math.floor(Math.random() * 3),
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 2),
        totalCredits: prev.totalCredits + Math.floor(Math.random() * 100),
        recentSignups: prev.recentSignups + Math.floor(Math.random() * 2),
      }));
    }, 5000);

    setLoading(false);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box>
      {/* Real-time Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <PersonIcon color="primary" />
                <Box>
                  <Typography variant="h6">{stats.totalUsers}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <CheckCircleIcon color="success" />
                <Box>
                  <Typography variant="h6">{stats.activeUsers}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Active Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <MoneyIcon color="warning" />
                <Box>
                  <Typography variant="h6">{stats.totalCredits.toLocaleString()}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Credits
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <TrendingUpIcon color="info" />
                <Box>
                  <Typography variant="h6">{stats.recentSignups}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Recent Signups
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Users List */}
      <List {...props} actions={<ListActions />}>
        <Datagrid rowClick="show">
          <TextField source="id" label="ID" />
          <TextField source="name" label="Name" />
          <EmailField source="email" label="Email" />
          <FunctionField render={(record: any) => <TierChip record={record} />} label="Tier" />
          <FunctionField render={(record: any) => <CreditsField record={record} />} label="Credits" />
          <FunctionField render={(record: any) => <StatusChip record={record} />} label="Status" />
          <FunctionField render={(record: any) => <LastActivityField record={record} />} label="Last Activity" />
          <DateField source="created_at" label="Joined" showTime />
        </Datagrid>
      </List>
    </Box>
  );
};

export const UserEdit = (props: any) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="email" />
      <TextInput source="tier" />
      <TextInput source="credits" type="number" />
      <TextInput source="is_active" />
    </SimpleForm>
  </Edit>
);

export const UserCreate = (props: any) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="email" />
      <TextInput source="password" type="password" />
      <TextInput source="tier" />
      <TextInput source="credits" type="number" />
    </SimpleForm>
  </Create>
);

export const UserShow = (props: any) => (
  <Show {...props}>
    <SimpleShowLayout>
      <TextField source="id" />
      <TextField source="name" />
      <EmailField source="email" />
      <TextField source="tier" />
      <NumberField source="credits" />
      <BooleanField source="is_active" />
      <DateField source="created_at" />
      <DateField source="updated_at" />
    </SimpleShowLayout>
  </Show>
);

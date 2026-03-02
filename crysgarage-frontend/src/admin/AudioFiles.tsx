import React, { useState, useEffect } from 'react';
import {
  List,
  Datagrid,
  TextField,
  NumberField,
  DateField,
  Edit,
  SimpleForm,
  TextInput,
  Create,
  Show,
  SimpleShowLayout,
  BooleanField,
  FileField,
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
  MusicNote as MusicIcon,
  Storage as StorageIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  FileDownload as DownloadIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
} from '@mui/icons-material';

const ListActions = (props: any) => (
  <TopToolbar>
    <CreateButton />
    <ExportButton />
    <RefreshButton />
  </TopToolbar>
);

const FileSizeField = ({ record }: any) => {
  const size = record?.file_size || 0;
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <StorageIcon fontSize="small" color="primary" />
      <Typography variant="body2">{formatSize(size)}</Typography>
    </Box>
  );
};

const ProcessingStatusField = ({ record }: any) => {
  const isProcessed = record?.is_processed;
  const processingStatus = record?.processing_status || 'completed';
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'warning';
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'pending': return 'info';
      default: return 'default';
    }
  };

  return (
    <Chip
      icon={isProcessed ? <CheckCircleIcon /> : <ScheduleIcon />}
      label={isProcessed ? 'Processed' : 'Processing'}
      color={getStatusColor(processingStatus)}
      size="small"
    />
  );
};

const TierChip = ({ record }: any) => {
  const getTierColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'free': return 'default';
      case 'professional': return 'primary';
      case 'advanced': return 'secondary';
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

const AudioPlayerField = ({ record }: any) => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  const handlePlay = () => {
    setIsPlaying(!isPlaying);
    // Audio playback logic would go here
  };

  return (
    <Tooltip title={isPlaying ? "Stop" : "Play"}>
      <IconButton size="small" onClick={handlePlay}>
        {isPlaying ? <StopIcon /> : <PlayIcon />}
      </IconButton>
    </Tooltip>
  );
};

export const AudioFilesList = (props: any) => {
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalSize: 0,
    processedFiles: 0,
    processingFiles: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate real-time stats update
    const interval = setInterval(() => {
      setStats(prev => ({
        totalFiles: prev.totalFiles + Math.floor(Math.random() * 2),
        totalSize: prev.totalSize + Math.floor(Math.random() * 1000000),
        processedFiles: prev.processedFiles + Math.floor(Math.random() * 1),
        processingFiles: Math.floor(Math.random() * 3),
      }));
    }, 3000);

    setLoading(false);
    return () => clearInterval(interval);
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box>
      {/* Real-time Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <MusicIcon color="primary" />
                <Box>
                  <Typography variant="h6">{stats.totalFiles}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Files
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
                <StorageIcon color="warning" />
                <Box>
                  <Typography variant="h6">{formatSize(stats.totalSize)}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Size
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
                  <Typography variant="h6">{stats.processedFiles}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Processed
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
                <ScheduleIcon color="info" />
                <Box>
                  <Typography variant="h6">{stats.processingFiles}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Processing
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Audio Files List */}
      <List {...props} actions={<ListActions />}>
        <Datagrid rowClick="show">
          <TextField source="id" label="ID" />
          <TextField source="filename" label="Filename" />
          <TextField source="original_filename" label="Original" />
          <FunctionField render={(record: any) => <FileSizeField record={record} />} label="Size" />
          <TextField source="format" label="Format" />
          <FunctionField render={(record: any) => <TierChip record={record} />} label="Tier" />
          <FunctionField render={(record: any) => <ProcessingStatusField record={record} />} label="Status" />
          <FunctionField render={(record: any) => <AudioPlayerField record={record} />} label="Play" />
          <DateField source="created_at" label="Uploaded" showTime />
        </Datagrid>
      </List>
    </Box>
  );
};

export const AudioFileEdit = (props: any) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="filename" />
      <TextInput source="original_filename" />
      <TextInput source="file_size" type="number" />
      <TextInput source="format" />
      <TextInput source="tier" />
      <TextInput source="is_processed" />
    </SimpleForm>
  </Edit>
);

export const AudioFileCreate = (props: any) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="filename" />
      <TextInput source="original_filename" />
      <TextInput source="file_size" type="number" />
      <TextInput source="format" />
      <TextInput source="tier" />
    </SimpleForm>
  </Create>
);

export const AudioFileShow = (props: any) => (
  <Show {...props}>
    <SimpleShowLayout>
      <TextField source="id" />
      <TextField source="filename" />
      <TextField source="original_filename" />
      <NumberField source="file_size" />
      <TextField source="format" />
      <TextField source="tier" />
      <BooleanField source="is_processed" />
      <DateField source="created_at" />
      <DateField source="updated_at" />
    </SimpleShowLayout>
  </Show>
);

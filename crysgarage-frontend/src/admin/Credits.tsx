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
  SelectField,
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
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  AccountBalance as BalanceIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';

const ListActions = (props: any) => (
  <TopToolbar>
    <CreateButton />
    <ExportButton />
    <RefreshButton />
  </TopToolbar>
);

const TransactionTypeChip = ({ record }: any) => {
  const type = record?.type;
  const amount = record?.amount || 0;
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'purchase': return 'success';
      case 'usage': return 'error';
      case 'bonus': return 'info';
      case 'refund': return 'warning';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'purchase': return <TrendingUpIcon />;
      case 'usage': return <TrendingDownIcon />;
      case 'bonus': return <CheckCircleIcon />;
      case 'refund': return <ScheduleIcon />;
      default: return <MoneyIcon />;
    }
  };

  return (
    <Chip
      icon={getTypeIcon(type)}
      label={type?.charAt(0).toUpperCase() + type?.slice(1) || 'Unknown'}
      color={getTypeColor(type)}
      size="small"
    />
  );
};

const AmountField = ({ record }: any) => {
  const amount = record?.amount || 0;
  const type = record?.type;
  const isPositive = type === 'purchase' || type === 'bonus' || type === 'refund';
  
  return (
    <Box display="flex" alignItems="center" gap={1}>
      {isPositive ? (
        <TrendingUpIcon fontSize="small" color="success" />
      ) : (
        <TrendingDownIcon fontSize="small" color="error" />
      )}
      <Typography 
        variant="body2" 
        color={isPositive ? 'success.main' : 'error.main'}
        fontWeight="bold"
      >
        {isPositive ? '+' : '-'}${Math.abs(amount).toLocaleString()}
      </Typography>
    </Box>
  );
};

const BalanceField = ({ record }: any) => {
  const balance = record?.balance_after || 0;
  
  return (
    <Box display="flex" alignItems="center" gap={1}>
      <BalanceIcon fontSize="small" color="primary" />
      <Typography variant="body2" fontWeight="bold">
        ${balance.toLocaleString()}
      </Typography>
    </Box>
  );
};

export const CreditsList = (props: any) => {
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalRevenue: 0,
    totalCreditsUsed: 0,
    averageTransaction: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate real-time stats update
    const interval = setInterval(() => {
      setStats(prev => ({
        totalTransactions: prev.totalTransactions + Math.floor(Math.random() * 2),
        totalRevenue: prev.totalRevenue + Math.floor(Math.random() * 100),
        totalCreditsUsed: prev.totalCreditsUsed + Math.floor(Math.random() * 5),
        averageTransaction: Math.floor(Math.random() * 50) + 25,
      }));
    }, 4000);

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
                <ReceiptIcon color="primary" />
                <Box>
                  <Typography variant="h6">{stats.totalTransactions}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Transactions
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
                <MoneyIcon color="success" />
                <Box>
                  <Typography variant="h6">${stats.totalRevenue.toLocaleString()}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Revenue
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
                <TrendingDownIcon color="warning" />
                <Box>
                  <Typography variant="h6">{stats.totalCreditsUsed}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Credits Used
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
                <BalanceIcon color="info" />
                <Box>
                  <Typography variant="h6">${stats.averageTransaction}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Avg Transaction
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Credits List */}
      <List {...props} actions={<ListActions />}>
        <Datagrid rowClick="show">
          <TextField source="id" label="ID" />
          <TextField source="user_id" label="User ID" />
          <FunctionField render={(record: any) => <AmountField record={record} />} label="Amount" />
          <FunctionField render={(record: any) => <TransactionTypeChip record={record} />} label="Type" />
          <TextField source="description" label="Description" />
          <FunctionField render={(record: any) => <BalanceField record={record} />} label="Balance After" />
          <DateField source="timestamp" label="Date" showTime />
        </Datagrid>
      </List>
    </Box>
  );
};

export const CreditEdit = (props: any) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="user_id" />
      <TextInput source="amount" type="number" />
      <TextInput source="type" />
      <TextInput source="description" />
      <TextInput source="balance_after" type="number" />
    </SimpleForm>
  </Edit>
);

export const CreditCreate = (props: any) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="user_id" />
      <TextInput source="amount" type="number" />
      <TextInput source="type" />
      <TextInput source="description" />
    </SimpleForm>
  </Create>
);

export const CreditShow = (props: any) => (
  <Show {...props}>
    <SimpleShowLayout>
      <TextField source="id" />
      <TextField source="user_id" />
      <NumberField source="amount" />
      <TextField source="type" />
      <TextField source="description" />
      <NumberField source="balance_after" />
      <DateField source="timestamp" />
    </SimpleShowLayout>
  </Show>
);

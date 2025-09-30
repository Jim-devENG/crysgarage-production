import React from 'react';
import { Layout, AppBar, Title } from 'react-admin';
import { Typography } from '@mui/material';

const CustomAppBar = () => (
  <AppBar>
    <Title title="Crys Garage Admin" />
    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
      Audio Mastering Platform Administration
    </Typography>
  </AppBar>
);

export const CustomLayout = (props: any) => (
  <Layout {...props} appBar={CustomAppBar} />
);


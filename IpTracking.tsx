import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  DateField,
  BooleanField,
  Show,
  SimpleShowLayout,
} from 'react-admin';

export const IpTrackingList = (props: any) => (
  <List {...props}>
    <Datagrid rowClick="show">
      <TextField source="ip" />
      <BooleanField source="is_registered" />
      <DateField source="registered_at" />
      <TextField source="user_agent" />
    </Datagrid>
  </List>
);

export const IpTrackingShow = (props: any) => (
  <Show {...props}>
    <SimpleShowLayout>
      <TextField source="ip" />
      <BooleanField source="is_registered" />
      <DateField source="registered_at" />
      <TextField source="user_agent" />
    </SimpleShowLayout>
  </Show>
);


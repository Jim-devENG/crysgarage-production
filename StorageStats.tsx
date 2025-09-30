import React from 'react';
import {
  List,
  Datagrid,
  NumberField,
  TextField,
  Show,
  SimpleShowLayout,
} from 'react-admin';

export const StorageStats = (props: any) => (
  <List {...props}>
    <Datagrid rowClick="show">
      <NumberField source="processed_files_count" />
      <NumberField source="total_size_bytes" />
      <NumberField source="total_size_mb" />
      <NumberField source="free_space_mb" />
    </Datagrid>
  </List>
);

export const StorageStatsShow = (props: any) => (
  <Show {...props}>
    <SimpleShowLayout>
      <NumberField source="processed_files_count" />
      <NumberField source="total_size_bytes" />
      <NumberField source="total_size_mb" />
      <NumberField source="free_space_mb" />
    </SimpleShowLayout>
  </Show>
);


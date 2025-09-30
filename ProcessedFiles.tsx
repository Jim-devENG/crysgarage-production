import React from 'react';
import {
  List,
  Datagrid,
  NumberField,
  TextField,
  DateField,
  Show,
  SimpleShowLayout,
} from 'react-admin';

export const ProcessedFilesList = (props: any) => (
  <List {...props}>
    <Datagrid rowClick="show">
      <TextField source="file_id" />
      <TextField source="original_filename" />
      <TextField source="processed_filename" />
      <TextField source="format" />
      <NumberField source="file_size" />
      <DateField source="processed_at" />
    </Datagrid>
  </List>
);

export const ProcessedFilesShow = (props: any) => (
  <Show {...props}>
    <SimpleShowLayout>
      <TextField source="file_id" />
      <TextField source="original_filename" />
      <TextField source="processed_filename" />
      <TextField source="format" />
      <NumberField source="file_size" />
      <DateField source="processed_at" />
    </SimpleShowLayout>
  </Show>
);


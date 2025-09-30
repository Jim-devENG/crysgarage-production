import React from 'react';
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
} from 'react-admin';

export const AudioFilesList = (props: any) => (
  <List {...props}>
    <Datagrid rowClick="show">
      <TextField source="id" />
      <TextField source="filename" />
      <TextField source="original_filename" />
      <NumberField source="file_size" />
      <TextField source="format" />
      <TextField source="tier" />
      <BooleanField source="is_processed" />
      <DateField source="created_at" />
    </Datagrid>
  </List>
);

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


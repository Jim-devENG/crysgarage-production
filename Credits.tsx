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
  SelectField,
} from 'react-admin';

export const CreditsList = (props: any) => (
  <List {...props}>
    <Datagrid rowClick="show">
      <TextField source="id" />
      <TextField source="user_id" />
      <NumberField source="amount" />
      <SelectField source="type" choices={[
        { id: 'purchase', name: 'Purchase' },
        { id: 'usage', name: 'Usage' },
        { id: 'bonus', name: 'Bonus' },
      ]} />
      <TextField source="description" />
      <NumberField source="balance_after" />
      <DateField source="timestamp" />
    </Datagrid>
  </List>
);

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


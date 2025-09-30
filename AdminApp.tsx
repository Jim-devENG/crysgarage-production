import React from 'react';
import { Admin, Resource, ListGuesser, EditGuesser, ShowGuesser } from 'react-admin';
import { Dashboard } from './Dashboard';
import { UsersList, UserEdit, UserCreate } from './Users';
import { AudioFilesList, AudioFileEdit, AudioFileCreate } from './AudioFiles';
import { CreditsList, CreditEdit, CreditCreate } from './Credits';
import { IpTrackingList } from './IpTracking';
import { StorageStats } from './StorageStats';
import { ProcessedFilesList } from './ProcessedFiles';
import { CustomLayout } from './Layout';
import { CustomTheme } from './Theme';
import { authProvider } from './AuthProvider';
import { dataProvider } from './DataProvider';

const App = () => (
  <Admin
    title="Crys Garage Admin"
    layout={CustomLayout}
    theme={CustomTheme}
    dataProvider={dataProvider}
    authProvider={authProvider}
    dashboard={Dashboard}
  >
    <Resource
      name="users"
      list={UsersList}
      edit={UserEdit}
      create={UserCreate}
      show={ShowGuesser}
    />
    <Resource
      name="audio-files"
      list={AudioFilesList}
      edit={AudioFileEdit}
      create={AudioFileCreate}
      show={ShowGuesser}
    />
    <Resource
      name="credits"
      list={CreditsList}
      edit={CreditEdit}
      create={CreditCreate}
      show={ShowGuesser}
    />
    <Resource
      name="ip-tracking"
      list={IpTrackingList}
    />
    <Resource
      name="storage-stats"
      list={StorageStats}
    />
    <Resource
      name="processed-files"
      list={ProcessedFilesList}
    />
  </Admin>
);

export default App;


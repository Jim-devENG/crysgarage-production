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

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class AdminErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Admin Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-crys-black text-crys-white p-8">
          <div className="bg-red-900 border border-red-500 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Admin Error</h1>
            <p className="text-red-200 mb-4">
              The admin dashboard encountered an error. This won't affect the main site.
            </p>
            <button 
              onClick={() => window.location.href = '/'}
              className="bg-crys-gold text-crys-black px-4 py-2 rounded hover:bg-crys-gold-muted transition-colors"
            >
              Return to Main Site
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const App = () => (
  <AdminErrorBoundary>
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
  </AdminErrorBoundary>
);

export default App;

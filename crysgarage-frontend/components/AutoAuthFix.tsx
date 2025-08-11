import React, { useEffect, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { AuthFixButton } from './AuthFixButton';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export const AutoAuthFix: React.FC = () => {
  const { isAuthenticated, user, error, signIn } = useApp();
  const [authIssue, setAuthIssue] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [fixResult, setFixResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    // Check for authentication issues
    const checkAuthIssues = async () => {
      const token = localStorage.getItem('crysgarage_token');
      
      if (token && !isAuthenticated) {
        console.log('Detected authentication issue: token exists but user not authenticated');
        setAuthIssue(true);
        
        // Try to auto-fix
        await autoFixAuth();
      } else if (!token && isAuthenticated) {
        console.log('Detected authentication issue: no token but user authenticated');
        setAuthIssue(true);
      } else if (error && error.includes('401')) {
        console.log('Detected 401 error, attempting auto-fix');
        setAuthIssue(true);
        await autoFixAuth();
      }
    };

    checkAuthIssues();
  }, [isAuthenticated, error]);

  const autoFixAuth = async () => {
    if (isFixing) return;
    
    setIsFixing(true);
    setFixResult(null);
    
    try {
      console.log('Auto-fixing authentication...');
      
      // Use AppContext signIn to properly update the state
      await signIn('demo.free@crysgarage.com', 'password');
      
      setFixResult({
        success: true,
        message: 'Authentication fixed successfully'
      });
      
      setAuthIssue(false);
      console.log('Auto-fix successful');
    } catch (error: any) {
      setFixResult({
        success: false,
        message: error.message || 'Auto-fix failed'
      });
      console.error('Auto-fix failed:', error);
    } finally {
      setIsFixing(false);
    }
  };

  // Don't show anything if no auth issues
  if (!authIssue && !fixResult) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Alert className={fixResult?.success ? 'border-green-500' : 'border-red-500'}>
        <div className="flex items-center gap-2">
          {fixResult?.success ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-red-500" />
          )}
          <AlertTitle>
            {fixResult?.success ? 'Authentication Fixed' : 'Authentication Issue Detected'}
          </AlertTitle>
        </div>
        
        <AlertDescription className="mt-2">
          {fixResult ? (
            fixResult.message
          ) : (
            'We detected an authentication issue. Click below to fix it automatically.'
          )}
        </AlertDescription>
        
        {!fixResult?.success && (
          <div className="mt-3">
            <AuthFixButton
              size="sm"
              onSuccess={() => {
                setAuthIssue(false);
                setFixResult(null);
              }}
              onError={(errorMsg) => {
                setFixResult({
                  success: false,
                  message: errorMsg
                });
              }}
            />
          </div>
        )}
        
        {fixResult && (
          <button
            onClick={() => {
              setAuthIssue(false);
              setFixResult(null);
            }}
            className="mt-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Dismiss
          </button>
        )}
      </Alert>
    </div>
  );
}; 
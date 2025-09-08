import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Input } from './ui/input';

const DevAccess: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/dev-mode/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Login failed');
      }
      setMessage('Dev mode enabled. Reloading...');
      setTimeout(() => window.location.reload(), 800);
    } catch (err: any) {
      setMessage(err.message || 'Failed to enable dev mode');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/dev-mode/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      setMessage('Dev mode disabled. Reloading...');
      setTimeout(() => window.location.reload(), 800);
    } catch (_) {
      setMessage('Failed to disable dev mode');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-crys-black text-crys-white flex items-center justify-center px-4 py-12">
      <Card className="bg-audio-panel-bg border-audio-panel-border w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold text-center">Dev Access</h1>
          <p className="text-center text-crys-light-grey text-sm">Enter credentials to enable temporary Dev Mode</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Email</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm mb-1">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <Button disabled={loading} className="w-full bg-crys-gold text-crys-black hover:bg-crys-gold/90" type="submit">
              {loading ? 'Please wait...' : 'Enable Dev Mode'}
            </Button>
            <Button disabled={loading} variant="outline" className="w-full border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10" type="button" onClick={handleLogout}>
              Disable Dev Mode
            </Button>
            {message && <p className="text-center text-sm text-crys-light-grey">{message}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DevAccess;



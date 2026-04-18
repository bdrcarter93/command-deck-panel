import { useState, useEffect } from 'react';
import { Shield, Eye, EyeOff, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const SESSION_KEY = 'oc_dashboard_auth';
const SESSION_TTL = 8 * 60 * 60 * 1000; // 8 hours

const AUTH_MODE = String(import.meta.env.VITE_DASHBOARD_AUTH_MODE || '').toLowerCase();
const AUTH_DISABLED = AUTH_MODE === 'off' || AUTH_MODE === 'disabled' || (import.meta.env.DEV && AUTH_MODE !== 'required');

// Credentials come from Vercel env vars (baked in at build time)
const VALID_USER = import.meta.env.VITE_DASHBOARD_USER || 'admin';
const VALID_PASS = import.meta.env.VITE_DASHBOARD_PASS || '';

interface Props {
  children: React.ReactNode;
}

function checkSession(): boolean {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const { ts } = JSON.parse(raw);
    return Date.now() - ts < SESSION_TTL;
  } catch {
    return false;
  }
}

function saveSession() {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ts: Date.now() }));
}

export default function LoginGate({ children }: Props) {
  const [authed, setAuthed] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  useEffect(() => {
    // Allow explicit bypass for local or preview environments.
    if (AUTH_DISABLED || !VALID_PASS) {
      setAuthed(true);
      return;
    }
    if (checkSession()) {
      setAuthed(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username === VALID_USER && password === VALID_PASS) {
      saveSession();
      setAuthed(true);
    } else {
      setError('Invalid username or password.');
      setShake(true);
      setTimeout(() => setShake(false), 600);
      setPassword('');
    }
  };

  if (authed) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className={`w-full max-w-sm ${shake ? 'animate-shake' : ''}`}>
        {/* Logo / header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">Command Deck</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to continue</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-xl"
        >
          <div>
            <Label htmlFor="username" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              autoComplete="username"
              className="mt-1.5"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Password
            </Label>
            <div className="relative mt-1.5">
              <Input
                id="password"
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                className="pr-10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 flex items-center gap-1.5">
              <Lock className="w-3 h-3 shrink-0" />
              {error}
            </p>
          )}

          <Button type="submit" className="w-full mt-2">
            Sign in
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground/40 mt-6">
          OpenClaw Command Deck · Private access only
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  );
}

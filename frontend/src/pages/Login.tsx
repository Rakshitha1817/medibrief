import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { MediBriefWordmark } from '../components/Logo';
import { useTheme } from '../store/ThemeContext';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', borderRadius: '10px',
  border: '1px solid var(--border)', background: 'var(--bg-elevated)',
  color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
  transition: 'border-color 0.15s',
};

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); }
    else navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      {/* Left branding panel */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}
      >
        <MediBriefWordmark size={34} />
        <div>
          <h1 className="text-4xl font-bold mb-4 leading-tight" style={{ color: 'var(--text-primary)' }}>
            Understand your<br />health, instantly.
          </h1>
          <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
            Upload your lab reports and prescriptions. Get AI-powered summaries in plain English — no medical degree required.
          </p>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>© 2025 MediBrief · Health Insights Made Simple</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        {/* Theme toggle top-right */}
        <button
          onClick={toggleTheme}
          className="absolute top-6 right-6 p-2.5 rounded-xl transition-all duration-150"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-hover)'}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'}
        >
          {theme === 'dark'
            ? <Sun  className="w-4 h-4" style={{ color: 'var(--warning)' }} />
            : <Moon className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          }
        </button>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-10 lg:hidden">
            <MediBriefWordmark size={30} />
          </div>

          <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Welcome back</h2>
          <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>Sign in to your account to continue</p>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl text-sm" style={{ background: 'var(--danger-subtle)', color: 'var(--danger)' }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </div>
            )}
            <div className="space-y-3">
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" style={inputStyle}
                onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'var(--accent)'}
                onBlur={e  => (e.target as HTMLInputElement).style.borderColor = 'var(--border)'} />
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" style={inputStyle}
                onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'var(--accent)'}
                onBlur={e  => (e.target as HTMLInputElement).style.borderColor = 'var(--border)'} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-150 active:scale-[0.98] disabled:opacity-60"
              style={{ background: 'var(--accent)' }}
              onMouseEnter={e => !loading && ((e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-hover)')}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)'}
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold" style={{ color: 'var(--accent-hover)' }}>Create one</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

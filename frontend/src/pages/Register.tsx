import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2, CheckCircle, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { MediBriefWordmark } from '../components/Logo';
import { useTheme } from '../store/ThemeContext';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', borderRadius: '10px',
  border: '1px solid var(--border)', background: 'var(--bg-elevated)',
  color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
  transition: 'border-color 0.15s',
};

const features = [
  'AI-powered biomarker extraction',
  'Plain-English health summaries',
  'Lab reports & prescriptions',
];

export const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError(null);
    const { error } = await supabase.auth.signUp({
      email, password, options: { data: { full_name: fullName } }
    });
    if (error) { setError(error.message); setLoading(false); }
    else { setSuccess(true); setTimeout(() => navigate('/dashboard'), 1500); }
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
            Your personal<br />health analyst.
          </h1>
          <p className="text-base mb-8" style={{ color: 'var(--text-secondary)' }}>
            Join MediBrief to make sense of your medical reports in seconds — free, secure, and AI-powered.
          </p>
          <div className="space-y-3">
            {features.map(f => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--success-subtle)' }}>
                  <CheckCircle className="w-3 h-3" style={{ color: 'var(--success)' }} />
                </div>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>© 2025 MediBrief · Health Insights Made Simple</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        {/* Theme toggle */}
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
          <div className="mb-10 lg:hidden"><MediBriefWordmark size={30} /></div>

          <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Create your account</h2>
          <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>Free forever. No credit card required.</p>

          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl text-sm"
                style={{ background: 'var(--danger-subtle)', color: 'var(--danger)' }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 p-3 rounded-xl text-sm"
                style={{ background: 'var(--success-subtle)', color: 'var(--success)' }}>
                <CheckCircle className="w-4 h-4 flex-shrink-0" /> Account created! Redirecting...
              </div>
            )}

            <div className="space-y-3">
              {[
                { v: fullName, s: setFullName, p: 'Full name',               t: 'text',     id: 'fullName' },
                { v: email,    s: setEmail,    p: 'Email address',           t: 'email',    id: 'email' },
                { v: password, s: setPassword, p: 'Password (min 6 chars)', t: 'password', id: 'password' },
              ].map(({ v, s, p, t, id }) => (
                <input key={id} id={id} type={t} required value={v}
                  onChange={e => s(e.target.value)} placeholder={p} style={inputStyle}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'var(--accent)'}
                  onBlur={e  => (e.target as HTMLInputElement).style.borderColor = 'var(--border)'} />
              ))}
            </div>

            <button type="submit" disabled={loading || success}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-150 active:scale-[0.98] disabled:opacity-60"
              style={{ background: 'var(--accent)' }}
              onMouseEnter={e => !(loading || success) && ((e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-hover)')}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)'}
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold" style={{ color: 'var(--accent-hover)' }}>Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

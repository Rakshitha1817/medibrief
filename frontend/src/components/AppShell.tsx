import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useTheme } from '../store/ThemeContext';
import { LayoutDashboard, Upload, FileText, LogOut, ChevronRight, Sun, Moon } from 'lucide-react';
import { MediBriefWordmark } from './Logo';
import { motion } from 'framer-motion';

const navItems = [
  { to: '/dashboard', label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/upload',    label: 'Upload Report', icon: Upload },
  { to: '/reports',   label: 'My Reports',    icon: FileText },
];

/** Animated pill theme toggle */
const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '99px',
        border: '1px solid var(--border)',
        background: 'var(--bg-elevated)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-hover)'}
      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'}
    >
      {/* Track */}
      <div style={{
        width: '36px', height: '20px',
        borderRadius: '99px',
        background: isDark ? 'var(--accent)' : 'var(--bg-primary)',
        border: '1px solid var(--border)',
        position: 'relative',
        transition: 'background 0.25s ease',
        flexShrink: 0,
      }}>
        {/* Knob */}
        <motion.div
          animate={{ x: isDark ? 16 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          style={{
            position: 'absolute',
            top: '2px', left: '2px',
            width: '14px', height: '14px',
            borderRadius: '50%',
            background: isDark ? 'white' : 'var(--text-muted)',
          }}
        />
      </div>
      {/* Label */}
      <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
        {isDark ? 'Dark' : 'Light'}
      </span>
      {isDark
        ? <Moon  style={{ width: 13, height: 13, color: 'var(--accent-hover)', flexShrink: 0 }} />
        : <Sun   style={{ width: 13, height: 13, color: 'var(--warning)',       flexShrink: 0 }} />
      }
    </button>
  );
};

export const AppShell = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>

      {/* ── Sidebar ── */}
      <aside
        className="w-60 flex flex-col fixed inset-y-0 left-0 z-30"
        style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <MediBriefWordmark size={30} />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          <p className="px-3 mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Menu
          </p>
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
                style={{
                  background: active ? 'var(--accent-subtle)' : 'transparent',
                  color: active ? 'var(--accent-hover)' : 'var(--text-secondary)',
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = 'var(--bg-elevated)'; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: theme toggle + user */}
        <div className="px-3 py-4 space-y-3" style={{ borderTop: '1px solid var(--border)' }}>
          {/* Theme toggle */}
          <div className="flex justify-center">
            <ThemeToggle />
          </div>

          {/* User */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #6366f1, #22c55e)' }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{displayName}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-xl transition-all duration-150"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--danger)';
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--danger-subtle)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            }}
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

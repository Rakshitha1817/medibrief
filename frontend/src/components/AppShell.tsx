import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { LayoutDashboard, Upload, FileText, LogOut, Activity, User } from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/upload',    label: 'Upload Report', icon: Upload },
  { to: '/reports',   label: 'My Reports',    icon: FileText },
];

export const AppShell = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col fixed inset-y-0 left-0 z-30">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center mr-3 flex-shrink-0">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900">MediBrief</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-slate-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{displayName}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="mt-2 w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Disclaimer */}
        <div className="bg-amber-50 border-b border-amber-100 px-8 py-3 sticky top-0 z-20">
          <p className="text-xs text-amber-700">
            <span className="font-semibold">Medical Disclaimer:</span> MediBrief provides AI-generated informational analysis only. It is not a substitute for professional medical advice, diagnosis, or treatment.
          </p>
        </div>
        {/* Page */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { Upload } from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ label, value, sub }: { label: string; value: string; sub: string }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-sm transition-shadow">
    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</p>
    <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    <p className="mt-1 text-sm text-slate-500">{sub}</p>
  </div>
);

export const Dashboard = () => {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="p-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {displayName}</h1>
          <p className="mt-1 text-slate-500 text-sm">Your health overview and recent activity.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          <StatCard label="Health Score" value="—" sub="Upload a report to calculate" />
          <StatCard label="Reports Analyzed" value="0" sub="No reports uploaded yet" />
          <StatCard label="Last Report" value="—" sub="No activity yet" />
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Start your health analysis</h2>
            <p className="mt-1 text-sm text-slate-500 max-w-md">
              Upload a lab report or prescription to receive an instant, AI-powered summary and biomarker breakdown.
            </p>
          </div>
          <Link
            to="/upload"
            className="flex-shrink-0 flex items-center gap-2 px-6 py-3 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 active:scale-[0.98] transition-all duration-150"
          >
            <Upload className="w-4 h-4" />
            Upload Report
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

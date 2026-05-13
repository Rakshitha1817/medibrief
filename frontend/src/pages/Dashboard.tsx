import { Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { Upload, TrendingUp, FileText, Activity, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({
  label, value, sub, icon: Icon, accent
}: {
  label: string; value: string; sub: string;
  icon: React.ElementType; accent: string;
}) => (
  <motion.div
    whileHover={{ y: -2 }}
    className="rounded-2xl p-6 transition-all duration-200"
    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
  >
    <div className="flex items-start justify-between mb-4">
      <div
        className="p-2 rounded-xl"
        style={{ background: accent + '20', color: accent }}
      >
        <Icon className="w-4 h-4" />
      </div>
    </div>
    <p className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{value}</p>
    <p className="text-sm font-medium mb-0.5" style={{ color: 'var(--text-secondary)' }}>{label}</p>
    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</p>
  </motion.div>
);

export const Dashboard = () => {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="p-8 max-w-5xl mx-auto">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {displayName}
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Here is your health overview.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
      >
        <StatCard label="Health Score"      value="—"  sub="Upload a report to calculate" icon={Activity}    accent="var(--accent)" />
        <StatCard label="Reports Analyzed"  value="0"  sub="No reports uploaded yet"      icon={FileText}    accent="var(--success)" />
        <StatCard label="Trend"             value="—"  sub="No data available yet"         icon={TrendingUp}  accent="var(--sky)" />
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
        style={{
          background: 'linear-gradient(135deg, var(--accent-subtle) 0%, rgba(99,102,241,0.04) 100%)',
          border: '1px solid var(--accent-subtle)',
        }}
      >
        <div>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Analyze your first report
          </h2>
          <p className="text-sm max-w-md" style={{ color: 'var(--text-secondary)' }}>
            Upload a lab report or prescription to receive an AI-powered biomarker breakdown and health summary in seconds.
          </p>
        </div>
        <Link
          to="/upload"
          className="flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-150 active:scale-[0.97]"
          style={{ background: 'var(--accent)' }}
          onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = 'var(--accent-hover)'}
          onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = 'var(--accent)'}
        >
          <Upload className="w-4 h-4" />
          Upload Report
          <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>

    </div>
  );
};

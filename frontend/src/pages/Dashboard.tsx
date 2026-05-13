import { Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { Upload, TrendingUp, FileText, Activity, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import ReactMarkdown from 'react-markdown';

const StatCard = ({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  accent: string;
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

  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

// Fetch reports (no user filter – show all stored reports)
useEffect(() => {
  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('medical_reports')
        .select('id, file_name, biomarkers_json, ai_summary_text, uploaded_at, report_type')
        .order('uploaded_at', { ascending: false });
      if (error) throw error;
      setReports(data || []);
    } catch (e: any) {
      console.error('Failed to fetch reports:', e.message);
    } finally {
      setLoading(false);
    }
  };
  fetchReports();
}, []);

  // Compute a simple health score – average of numeric biomarker values if available
  const computeHealthScore = () => {
    if (reports.length === 0) return '—';
    let total = 0;
    let count = 0;
    reports.forEach(r => {
      const biomarkers = r.biomarkers_json as Record<string, any>;
      if (biomarkers) {
        Object.values(biomarkers).forEach((b: any) => {
          const val = parseFloat(b.value);
          if (!isNaN(val)) {
            total += val;
            count++;
          }
        });
      }
    });
    if (count === 0) return '—';
    const avg = total / count;
    const score = Math.min(100, Math.max(0, Math.round((avg / 200) * 100)));
    return `${score}`;
  };

  const healthScore = computeHealthScore();
  const reportsCount = reports.length.toString();
  const trend = reports.length > 0 ? '↑' : '—'; // simple placeholder

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
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
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <StatCard label="Health Score" value={healthScore} sub="Calculated from your reports" icon={Activity} accent="var(--accent)" />
        <StatCard label="Reports Analyzed" value={reportsCount} sub="Your uploaded reports" icon={FileText} accent="var(--success)" />
        <StatCard label="Trend" value={trend} sub="Recent activity" icon={TrendingUp} accent="var(--sky)" />
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
            {loading ? 'Loading your reports...' : reportsCount === '0' ? 'Analyze your first report' : 'Upload another report'}
          </h2>
          <p className="text-sm max-w-md" style={{ color: 'var(--text-secondary)' }}>
            Upload a lab report or prescription to receive an AI‑powered biomarker breakdown and health summary in seconds.
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

      {/* Past Reports List */}
      <section>
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Past Analyses</h2>
        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
        ) : reports.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No reports uploaded yet.</p>
        ) : (
          <div className="space-y-6">
            {reports.map((r) => (
              <div key={r.id} className="rounded-2xl p-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>{r.file_name}</h3>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{new Date(r.uploaded_at).toLocaleString()}</span>
                </div>
                <div className="prose prose-sm max-w-none" style={{ color: 'var(--text-primary)' }}>
                  <ReactMarkdown>
                    {r.ai_summary_text || r.prescription_analysis || '*No analysis available*'}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

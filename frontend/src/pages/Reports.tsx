import { useEffect, useState } from 'react';
import { useAuth } from '../store/AuthContext';
import { supabase } from '../services/supabaseClient';
import { Link } from 'react-router-dom';
import { FlaskConical, Pill, Upload, ChevronDown, ChevronUp, Calendar, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

interface Report {
  id: string;
  file_name: string;
  report_type: 'lab_report' | 'prescription';
  status: string;
  biomarkers_json: Record<string, any> | null;
  ai_summary_text: string | null;
  uploaded_at: string;
}

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  normal:     { bg: 'var(--success-subtle)',  color: 'var(--success)',  border: 'rgba(16,185,129,0.2)' },
  low:        { bg: 'var(--sky-subtle)',       color: 'var(--sky)',      border: 'rgba(56,189,248,0.2)' },
  high:       { bg: 'var(--danger-subtle)',    color: 'var(--danger)',   border: 'rgba(239,68,68,0.2)' },
  borderline: { bg: 'var(--warning-subtle)',   color: 'var(--warning)',  border: 'rgba(245,158,11,0.2)' },
  unknown:    { bg: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: 'var(--border)' },
};

const ReportCard = ({ report }: { report: Report }) => {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(report.uploaded_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
  const time = new Date(report.uploaded_at).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit',
  });
  const isPrescription = report.report_type === 'prescription';
  const biomarkerCount = report.biomarkers_json ? Object.keys(report.biomarkers_json).length : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
    >
      {/* Report header row */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-4 px-6 py-4 text-left transition-colors"
        style={{ background: expanded ? 'var(--bg-elevated)' : 'transparent' }}
        onMouseEnter={e => !expanded && ((e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-elevated)')}
        onMouseLeave={e => !expanded && ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
      >
        {/* Icon */}
        <div
          className="p-2.5 rounded-xl flex-shrink-0"
          style={{ background: isPrescription ? 'var(--success-subtle)' : 'var(--accent-subtle)' }}
        >
          {isPrescription
            ? <Pill className="w-4 h-4" style={{ color: 'var(--success)' }} />
            : <FlaskConical className="w-4 h-4" style={{ color: 'var(--accent-hover)' }} />
          }
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
            {report.file_name}
          </p>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {isPrescription ? 'Prescription' : 'Lab Report'}
            </span>
            {biomarkerCount > 0 && (
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                · {biomarkerCount} biomarkers
              </span>
            )}
          </div>
        </div>

        {/* Date */}
        <div className="text-right flex-shrink-0 hidden sm:block">
          <div className="flex items-center gap-1.5 justify-end">
            <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{date}</span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{time}</p>
        </div>

        {/* Expand toggle */}
        <div className="flex-shrink-0 ml-2" style={{ color: 'var(--text-muted)' }}>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden', borderTop: '1px solid var(--border)' }}
          >
            {/* Biomarkers */}
            {report.biomarkers_json && biomarkerCount > 0 && (
              <div className="px-6 pt-5 pb-3">
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
                  Biomarkers
                </p>
                <div className="space-y-2">
                  {Object.entries(report.biomarkers_json).map(([key, marker]: [string, any]) => {
                    const s = STATUS_STYLES[marker.status] || STATUS_STYLES.unknown;
                    return (
                      <div key={key} className="flex items-center justify-between py-2 px-3 rounded-xl"
                        style={{ background: 'var(--bg-elevated)' }}>
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            {marker.display_name || key.replace(/_/g, ' ')}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{marker.unit}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                            {marker.value}
                          </span>
                          <span className="px-2 py-0.5 text-xs font-semibold rounded-full"
                            style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                            {marker.status.charAt(0).toUpperCase() + marker.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* AI Summary */}
            {report.ai_summary_text && (
              <div className="px-6 pt-3 pb-6">
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
                  AI Summary
                </p>
                <div className="prose prose-sm max-w-none rounded-xl p-4"
                  style={{ background: 'var(--bg-elevated)' }}>
                  <ReactMarkdown>{report.ai_summary_text}</ReactMarkdown>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const Reports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data, error } = await supabase
        .from('medical_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false });
      if (!error && data) setReports(data as Report[]);
      setLoading(false);
    };
    fetch();
  }, [user]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            My Reports
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            All your past medical analyses — click any report to expand.
          </p>
        </div>
        <Link
          to="/upload"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.97]"
          style={{ background: 'var(--accent)' }}
          onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = 'var(--accent-hover)'}
          onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = 'var(--accent)'}
        >
          <Upload className="w-4 h-4" />
          Upload New
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'var(--bg-surface)' }} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && reports.length === 0 && (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-2xl text-center"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        >
          <div className="p-4 rounded-2xl mb-4" style={{ background: 'var(--bg-elevated)' }}>
            <FileText className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
          </div>
          <p className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No reports yet</p>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            Upload your first lab report or prescription to get started.
          </p>
          <Link
            to="/upload"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'var(--accent)' }}
          >
            <Upload className="w-4 h-4" />
            Upload Report
          </Link>
        </div>
      )}

      {/* Report list */}
      {!loading && reports.length > 0 && (
        <div className="space-y-3">
          {reports.map(report => <ReportCard key={report.id} report={report} />)}
        </div>
      )}
    </div>
  );
};

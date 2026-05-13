import React, { useCallback, useState } from 'react';
import { useAuth } from '../store/AuthContext';
import { supabase } from '../services/supabaseClient';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2, FlaskConical, Pill, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

type UploadMode = 'lab_report' | 'prescription';
type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  normal:     { bg: 'var(--success-subtle)',  color: 'var(--success)',  border: 'rgba(16,185,129,0.2)' },
  low:        { bg: 'var(--sky-subtle)',       color: 'var(--sky)',      border: 'rgba(56,189,248,0.2)' },
  high:       { bg: 'var(--danger-subtle)',    color: 'var(--danger)',   border: 'rgba(239,68,68,0.2)' },
  borderline: { bg: 'var(--warning-subtle)',   color: 'var(--warning)',  border: 'rgba(245,158,11,0.2)' },
  unknown:    { bg: 'rgba(255,255,255,0.03)',  color: 'var(--text-muted)', border: 'var(--border)' },
};

export const Upload = () => {
  const { user } = useAuth();
  const [mode, setMode] = useState<UploadMode>('lab_report');
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  const reset = () => { setFile(null); setStatus('idle'); setError(''); setResult(null); };

  const handleModeChange = (m: UploadMode) => { setMode(m); reset(); };

  const validate = (f: File): string | null => {
    const ok = ['application/pdf','image/jpeg','image/jpg','image/png','image/webp'].includes(f.type);
    if (!ok) return 'Please upload a PDF or image (JPG, PNG).';
    if (f.size > 10 * 1024 * 1024) return 'File size must be less than 10MB.';
    return null;
  };

  const pick = (f: File) => {
    const err = validate(f);
    if (err) { setError(err); setStatus('error'); setFile(null); return; }
    setFile(f); setStatus('idle'); setError(''); setResult(null);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type !== 'dragleave');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) pick(f);
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setStatus('uploading'); setError('');

    const endpoint = mode === 'prescription'
      ? 'http://localhost:8000/api/reports/upload-prescription'
      : 'http://localhost:8000/api/reports/upload';

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(endpoint, { method: 'POST', body: formData });
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail || 'Server error'); }
      const data = await res.json();
      setResult(data);
      setStatus('success');

      // ── Persist to Supabase ──────────────────────────────────
      if (user) {
        const aiText = data.ai_summary || data.prescription_analysis || null;
        const { error: dbErr } = await supabase
          .from('medical_reports')
          .insert({
            user_id:         user.id,
            file_name:       file.name,
            report_type:     mode,
            status:          'completed',
            biomarkers_json: data.biomarkers || null,
            ai_summary_text: aiText,
          });
        if (dbErr) console.warn('Could not save to history:', dbErr.message);
      }
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
      setStatus('error');
    }
  };

  const surface  = 'var(--bg-surface)';
  const elevated = 'var(--bg-elevated)';
  const border   = 'var(--border)';

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Upload Medical Document
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Lab reports and prescriptions analyzed instantly with AI.
        </p>
      </div>

      {/* Mode Tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl w-fit"
        style={{ background: elevated }}
      >
        {(['lab_report', 'prescription'] as UploadMode[]).map(m => (
          <button
            key={m}
            onClick={() => handleModeChange(m)}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            style={{
              background: mode === m ? surface : 'transparent',
              color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
              border: mode === m ? `1px solid ${border}` : '1px solid transparent',
            }}
          >
            {m === 'lab_report' ? <FlaskConical className="w-4 h-4" /> : <Pill className="w-4 h-4" />}
            {m === 'lab_report' ? 'Lab Report' : 'Prescription'}
          </button>
        ))}
      </div>

      {/* Upload Card */}
      <motion.div
        key={mode}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: surface, border: `1px solid ${border}` }}
      >
        <div className="p-8 space-y-5">

          {/* Drop Zone */}
          <div
            className="relative rounded-xl transition-all duration-200 cursor-pointer"
            style={{
              border: `2px dashed ${dragActive ? 'var(--accent)' : border}`,
              background: dragActive ? 'var(--accent-subtle)' : elevated,
              opacity: status === 'uploading' ? 0.5 : 1,
              pointerEvents: status === 'uploading' ? 'none' : 'auto',
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={e => e.target.files?.[0] && pick(e.target.files[0])}
              disabled={status === 'uploading'}
            />
            <div className="flex flex-col items-center justify-center py-14 gap-4">
              <div
                className="p-4 rounded-2xl transition-colors"
                style={{ background: dragActive ? 'var(--accent-subtle)' : 'rgba(255,255,255,0.04)' }}
              >
                <UploadCloud
                  className="w-8 h-8"
                  style={{ color: dragActive ? 'var(--accent-hover)' : 'var(--text-muted)' }}
                />
              </div>
              <div className="text-center">
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  {mode === 'lab_report' ? 'Drop your lab report here' : 'Drop your prescription here'}
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  PDF, JPG, or PNG · Max 10MB
                </p>
              </div>
              <span className="text-sm font-semibold" style={{ color: 'var(--accent-hover)' }}>
                Browse files
              </span>
            </div>
          </div>

          {/* Selected File */}
          <AnimatePresence>
            {file && status !== 'success' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-between px-4 py-3 rounded-xl"
                style={{ background: elevated, border: `1px solid ${border}` }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ background: 'var(--accent-subtle)' }}>
                    <FileText className="w-4 h-4" style={{ color: 'var(--accent-hover)' }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{file.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                {status === 'uploading'
                  ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--accent-hover)' }} />
                  : <button onClick={reset} className="p-1.5 rounded-lg transition-colors hover:opacity-70">
                      <X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    </button>
                }
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          {status === 'error' && (
            <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'var(--danger-subtle)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--danger)' }} />
              <p className="text-sm" style={{ color: 'var(--danger)' }}>{error}</p>
            </div>
          )}

          {/* Success banner */}
          {status === 'success' && (
            <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'var(--success-subtle)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <CheckCircle className="w-4 h-4" style={{ color: 'var(--success)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--success)' }}>Analysis complete — results are shown below.</p>
            </div>
          )}

          {file && status === 'idle' && (
            <button
              onClick={handleUpload}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-150 active:scale-[0.98]"
              style={{ background: 'var(--accent)' }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-hover)'}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)'}
            >
              Analyze Document
            </button>
          )}

          {status === 'success' && (
            <button
              onClick={reset}
              className="w-full py-3 rounded-xl text-sm font-medium transition-colors"
              style={{ background: elevated, color: 'var(--text-secondary)', border: `1px solid ${border}` }}
            >
              Upload Another Document
            </button>
          )}

        </div>
      </motion.div>

      {/* Biomarkers */}
      <AnimatePresence>
        {result?.biomarkers && Object.keys(result.biomarkers).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl overflow-hidden"
            style={{ background: surface, border: `1px solid ${border}` }}
          >
            <div className="px-8 py-5" style={{ borderBottom: `1px solid ${border}` }}>
              <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Extracted Biomarkers</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {Object.keys(result.biomarkers).length} parameters identified automatically
              </p>
            </div>
            <div>
              {Object.entries(result.biomarkers).map(([key, marker]: [string, any]) => {
                const s = STATUS_STYLES[marker.status] || STATUS_STYLES.unknown;
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between px-8 py-3.5 transition-colors"
                    style={{ borderBottom: `1px solid var(--border)` }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = elevated}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
                  >
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {marker.display_name || key.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{marker.unit}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                        {marker.value}
                      </span>
                      <span
                        className="px-2.5 py-1 text-xs font-semibold rounded-full"
                        style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
                      >
                        {marker.status.charAt(0).toUpperCase() + marker.status.slice(1)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Summary */}
      <AnimatePresence>
        {(result?.ai_summary || result?.prescription_analysis) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl overflow-hidden"
            style={{ background: surface, border: `1px solid ${border}` }}
          >
            <div className="px-8 py-5" style={{ borderBottom: `1px solid ${border}` }}>
              <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                {result.file_type === 'prescription' ? 'Prescription Breakdown' : 'AI Health Summary'}
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Powered by MediBrief AI · For informational purposes only
              </p>
            </div>
            <div className="px-8 py-6">
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{result.ai_summary || result.prescription_analysis}</ReactMarkdown>
              </div>
            </div>
            {/* Disclaimer — embedded at bottom of AI output where it belongs */}
            <div className="px-8 py-4" style={{ borderTop: `1px solid ${border}`, background: elevated }}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                <span className="font-semibold">Disclaimer:</span> This analysis is AI-generated and for informational purposes only.
                It does not constitute medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

import React, { useCallback, useState } from 'react';
import { useAuth } from '../store/AuthContext';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2, FlaskConical, Pill, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

type UploadMode = 'lab_report' | 'prescription';
type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

const STATUS_COLORS: Record<string, string> = {
  normal:     'bg-emerald-50 text-emerald-700 border-emerald-200',
  low:        'bg-sky-50 text-sky-700 border-sky-200',
  high:       'bg-red-50 text-red-700 border-red-200',
  borderline: 'bg-amber-50 text-amber-700 border-amber-200',
  unknown:    'bg-slate-100 text-slate-500 border-slate-200',
};

const ACCEPTED_TYPES: Record<UploadMode, string> = {
  lab_report:   '.pdf,.jpg,.jpeg,.png',
  prescription: '.pdf,.jpg,.jpeg,.png',
};

export const Upload = () => {
  const { user } = useAuth();
  const [mode, setMode] = useState<UploadMode>('lab_report');
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  const reset = () => {
    setFile(null);
    setStatus('idle');
    setError('');
    setResult(null);
  };

  const handleModeChange = (newMode: UploadMode) => {
    setMode(newMode);
    reset();
  };

  const validate = (f: File): string | null => {
    const allowedPdf = f.type === 'application/pdf';
    const allowedImg = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(f.type);
    if (!allowedPdf && !allowedImg) return 'Please upload a PDF or image file (JPG, PNG).';
    if (f.size > 10 * 1024 * 1024) return 'File size must be less than 10MB.';
    return null;
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type !== 'dragleave');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) pick(f);
  }, [mode]);

  const pick = (f: File) => {
    const err = validate(f);
    if (err) { setError(err); setStatus('error'); setFile(null); return; }
    setFile(f);
    setStatus('idle');
    setError('');
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus('uploading');
    setError('');

    const endpoint = mode === 'prescription'
      ? 'http://localhost:8000/api/reports/upload-prescription'
      : 'http://localhost:8000/api/reports/upload';

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(endpoint, { method: 'POST', body: formData });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Server error');
      }
      const data = await res.json();
      setResult(data);
      setStatus('success');
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
      setStatus('error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Upload Medical Document</h1>
        <p className="mt-1 text-slate-500">Analyze lab reports and prescriptions with AI-powered insights.</p>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
        {(['lab_report', 'prescription'] as UploadMode[]).map(m => (
          <button
            key={m}
            onClick={() => handleModeChange(m)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              mode === m
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {m === 'lab_report' ? <FlaskConical className="w-4 h-4" /> : <Pill className="w-4 h-4" />}
            {m === 'lab_report' ? 'Lab Report' : 'Prescription'}
          </button>
        ))}
      </div>

      {/* Upload Card */}
      <motion.div
        key={mode}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
      >
        <div className="p-8 space-y-6">
          {/* Drop Zone */}
          <div
            className={`relative border-2 border-dashed rounded-xl transition-colors duration-200 ${
              dragActive ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            } ${status === 'uploading' ? 'opacity-50 pointer-events-none' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept={ACCEPTED_TYPES[mode]}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={e => e.target.files?.[0] && pick(e.target.files[0])}
              disabled={status === 'uploading'}
            />
            <div className="flex flex-col items-center justify-center py-14 gap-4">
              <div className={`p-4 rounded-2xl transition-colors ${dragActive ? 'bg-blue-100' : 'bg-slate-100'}`}>
                <UploadCloud className={`w-8 h-8 ${dragActive ? 'text-blue-500' : 'text-slate-400'}`} />
              </div>
              <div className="text-center">
                <p className="font-medium text-slate-700">
                  {mode === 'lab_report' ? 'Drop your lab report here' : 'Drop your prescription here'}
                </p>
                <p className="text-sm text-slate-400 mt-1">PDF, JPG, or PNG · Max 10MB</p>
              </div>
              <span className="text-sm font-medium text-blue-600 cursor-pointer hover:text-blue-700">
                Browse files
              </span>
            </div>
          </div>

          {/* Selected File */}
          <AnimatePresence>
            {file && status !== 'success' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{file.name}</p>
                    <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                {status === 'uploading'
                  ? <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                  : <button onClick={reset} className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors"><X className="w-4 h-4 text-slate-400" /></button>
                }
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          {status === 'error' && (
            <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Success banner */}
          {status === 'success' && (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <p className="text-sm text-emerald-700 font-medium">Analysis complete. Results shown below.</p>
            </div>
          )}

          {/* Upload Button */}
          {file && status === 'idle' && (
            <button
              onClick={handleUpload}
              className="w-full py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700 active:scale-[0.98] transition-all duration-150"
            >
              Analyze Document
            </button>
          )}

          {/* Upload another */}
          {status === 'success' && (
            <button
              onClick={reset}
              className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Upload Another Document
            </button>
          )}
        </div>
      </motion.div>

      {/* Results: Biomarkers */}
      <AnimatePresence>
        {result?.biomarkers && Object.keys(result.biomarkers).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="px-8 py-6 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Extracted Biomarkers</h2>
              <p className="text-sm text-slate-400 mt-0.5">{Object.keys(result.biomarkers).length} parameters identified</p>
            </div>
            <div className="divide-y divide-slate-50">
              {Object.entries(result.biomarkers).map(([key, marker]: [string, any]) => (
                <div key={key} className="flex items-center justify-between px-8 py-4 hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{marker.display_name || key.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{marker.unit}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-slate-900 tabular-nums">{marker.value}</span>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${STATUS_COLORS[marker.status] || STATUS_COLORS.unknown}`}>
                      {marker.status.charAt(0).toUpperCase() + marker.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results: AI Summary */}
      <AnimatePresence>
        {result?.ai_summary && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="px-8 py-6 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">
                {result.file_type === 'prescription' ? 'Prescription Analysis' : 'AI Health Summary'}
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">Generated by MediBrief AI · Informational only</p>
            </div>
            <div className="px-8 py-6">
              <div className="prose prose-sm prose-slate max-w-none
                prose-headings:font-semibold prose-headings:text-slate-800
                prose-h2:text-base prose-h2:mt-6 prose-h2:mb-2
                prose-h3:text-sm prose-h3:mt-4 prose-h3:mb-1
                prose-p:text-slate-600 prose-p:leading-relaxed
                prose-li:text-slate-600
                prose-strong:text-slate-800 prose-strong:font-semibold
                prose-hr:border-slate-100">
                <ReactMarkdown>{result.ai_summary || result.prescription_analysis}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        )}

        {/* Prescription results */}
        {result?.prescription_analysis && !result?.ai_summary && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="px-8 py-6 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Prescription Analysis</h2>
              <p className="text-sm text-slate-400 mt-0.5">Generated by MediBrief AI · Informational only</p>
            </div>
            <div className="px-8 py-6">
              <div className="prose prose-sm prose-slate max-w-none
                prose-headings:font-semibold prose-headings:text-slate-800
                prose-h2:text-base prose-h2:mt-6 prose-h2:mb-2
                prose-h3:text-sm prose-h3:mt-4 prose-h3:mb-1
                prose-p:text-slate-600 prose-p:leading-relaxed
                prose-li:text-slate-600
                prose-strong:text-slate-800">
                <ReactMarkdown>{result.prescription_analysis}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

import React, { useState } from 'react';
import { X, UploadCloud, FileText, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiClient } from '../api/client';

export default function BulkImportModal({ isOpen, onClose, onSuccess }) {
  if (!isOpen) return null;

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please choose a CSV file to upload.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await apiClient.bulkImportStudents(formData);
      setResult(res);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to upload and process CSV file.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSample = () => {
    const csvContent = 
`USN,Full Name,Email,Phone,Department,Section,Academic Year,Technical,Sports,Cultural
25BTRCS101,Aarav Sharma,aarav.sharma@campusconnect.edu,+91 9876543210,Computer Science & Engineering,A,2025-2026,Yes,No,Yes
25BTRCC102,Diya Krishnan,diya.k@campusconnect.edu,+91 9876543211,Cyber Security,B,2025-2026,Yes,Yes,Yes
25BTRAI103,Rohan Verma,rohan.v@campusconnect.edu,+91 9876543212,Artificial Intelligence & Data Science,A,2025-2026,No,Yes,No
25BTRIS104,Pooja Hegde,pooja.h@campusconnect.edu,+91 9876543213,Information Science & Engineering,C,2025-2026,No,No,No`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'CampusConnect_Sample_Students_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-base">Bulk CSV Student Import</h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600">
            Upload a CSV file containing student records. The system will automatically prevent duplicate USNs and calculate mathematical set memberships.
          </p>

          <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs">
            <div className="flex items-center gap-2 text-blue-800 font-medium">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Need the expected column format?</span>
            </div>
            <button
              onClick={handleDownloadSample}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-white border border-blue-300 rounded-md hover:bg-blue-50 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV Template</span>
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{result.message}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-200/60 font-mono">
                <div>Imported: <span className="font-bold text-emerald-700">{result.imported_count}</span></div>
                <div>Duplicates Skipped: <span className="font-bold text-slate-600">{result.duplicates_skipped}</span></div>
              </div>
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors cursor-pointer bg-slate-50/50">
              <input
                type="file"
                accept=".csv"
                id="csv-file-input"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="csv-file-input" className="cursor-pointer flex flex-col items-center">
                <UploadCloud className="w-10 h-10 text-slate-400 mb-2" />
                <span className="text-xs font-semibold text-slate-700">
                  {file ? file.name : 'Click to select CSV file or drag and drop'}
                </span>
                <span className="text-[11px] text-slate-400 mt-1">UTF-8 CSV up to 16MB</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={!file || loading}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 shadow-xs"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>{loading ? 'Processing...' : 'Upload & Import'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

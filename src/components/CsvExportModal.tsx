import React, { useState } from 'react';
import type { CsvLogEntry } from '../types';
import { generateSampleCsvRows, convertToCsvString, downloadCsvFile } from '../utils/faceLandmarkData';
import { Download, X, FileSpreadsheet, Check } from 'lucide-react';

interface CsvExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  liveLogs: CsvLogEntry[];
}

export const CsvExportModal: React.FC<CsvExportModalProps> = ({
  isOpen,
  onClose,
  liveLogs,
}) => {
  const [downloaded, setDownloaded] = useState<boolean>(false);

  if (!isOpen) return null;

  const activeData: CsvLogEntry[] = liveLogs.length > 0 ? liveLogs : generateSampleCsvRows(20);

  const handleDownload = () => {
    const csvStr = convertToCsvString(activeData);
    const filename = `session_log_${new Date().toISOString().slice(0, 10)}_${Date.now().toString().slice(-4)}.csv`;
    downloadCsvFile(filename, csvStr);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Session Telemetry Log Data</h3>
              <p className="text-xs text-slate-500 font-mono-tech">session_log.csv schema & real-time export</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Table View */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono-tech text-slate-600">
            <span>SHOWING {activeData.length} FRAMES</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">FORMAT: RFC 4180 CSV</span>
              <span className="text-slate-300">•</span>
              <span className="text-blue-600 font-medium">ENCODING: UTF-8</span>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs font-mono-tech border-collapse">
              <thead className="bg-slate-100/75 border-b border-slate-200 text-slate-700">
                <tr>
                  <th className="py-2.5 px-3 whitespace-nowrap">timestamp_utc</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">frame_id</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">ear_avg</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">perclos_%</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">blink</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">yaw°</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">pitch°</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">attentive_score</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">dominant_emotion</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">conf_%</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">latency_ms</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeData.slice(0, 15).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-3 text-slate-500">{row.timestamp_utc.slice(11, 23)}</td>
                    <td className="py-2 px-3 text-slate-900 font-semibold">{row.frame_id}</td>
                    <td className="py-2 px-3 text-blue-600 font-medium">{row.ear_avg}</td>
                    <td className="py-2 px-3 text-slate-700">{row.perclos_pct}%</td>
                    <td className="py-2 px-3">
                      {row.blink_event ? (
                        <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-bold">TRUE</span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">FALSE</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-slate-700">{row.head_yaw_deg}°</td>
                    <td className="py-2 px-3 text-slate-700">{row.head_pitch_deg}°</td>
                    <td className="py-2 px-3 font-bold text-slate-900">{row.attentive_score}</td>
                    <td className="py-2 px-3 text-slate-800 font-medium">{row.dominant_emotion}</td>
                    <td className="py-2 px-3 text-slate-600">{row.emotion_confidence}%</td>
                    <td className="py-2 px-3 text-slate-500">{row.inference_latency_ms}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {activeData.length > 15 && (
            <p className="text-xs text-center text-slate-400 font-mono-tech">
              ... and {activeData.length - 15} more rows included in export file
            </p>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <div className="text-xs font-mono-tech text-slate-500">
            Total records ready for export: <strong className="text-slate-900">{activeData.length}</strong>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium font-mono-tech text-slate-600 hover:text-slate-900 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold font-mono-tech transition-colors shadow-sm"
            >
              {downloaded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Downloaded session_log.csv</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Export session_log.csv</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

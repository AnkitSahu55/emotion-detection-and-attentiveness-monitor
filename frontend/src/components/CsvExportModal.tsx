import React, { useState } from 'react';
import type { CsvLogEntry } from '../types';
import { generateSampleCsvRows, convertToCsvString, downloadCsvFile } from '../utils/faceLandmarkData';
import { Download, X, FileSpreadsheet, Check } from 'lucide-react';

interface CsvExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  liveLogs: CsvLogEntry[];
}

export const CsvExportModal: React.FC<CsvExportModalProps> = ({ isOpen, onClose, liveLogs }) => {
  const [downloaded, setDownloaded] = useState(false);
  if (!isOpen) return null;

  const activeData = liveLogs.length > 0 ? liveLogs : generateSampleCsvRows(20);

  const handleDownload = () => {
    const csvStr = convertToCsvString(activeData);
    const filename = `session_${new Date().toISOString().slice(0, 10)}_${Date.now().toString().slice(-4)}.csv`;
    downloadCsvFile(filename, csvStr);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white border border-gray-200 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Session telemetry</h3>
              <p className="text-xs text-gray-400">{activeData.length} frames · RFC 4180 CSV · UTF-8</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Table */}
        <div className="p-5 overflow-y-auto flex-1">
          <div className="border border-gray-100 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
                <tr>
                  {['Time', 'Frame', 'EAR avg', 'PERCLOS', 'Blink', 'Yaw°', 'Pitch°', 'Score', 'Emotion', 'Conf', 'Latency'].map(h => (
                    <th key={h} className="py-2.5 px-3 whitespace-nowrap font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {activeData.slice(0, 15).map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-3 text-gray-400 font-data">{row.timestamp_utc.slice(11, 23)}</td>
                    <td className="py-2 px-3 text-gray-700 font-data font-medium">{row.frame_id}</td>
                    <td className="py-2 px-3 text-blue-600 font-data">{row.ear_avg}</td>
                    <td className="py-2 px-3 text-gray-600 font-data">{row.perclos_pct}%</td>
                    <td className="py-2 px-3">
                      {row.blink_event
                        ? <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-600 text-[10px] font-medium">yes</span>
                        : <span className="text-gray-300 text-[10px]">—</span>}
                    </td>
                    <td className="py-2 px-3 text-gray-500 font-data">{row.head_yaw_deg}°</td>
                    <td className="py-2 px-3 text-gray-500 font-data">{row.head_pitch_deg}°</td>
                    <td className="py-2 px-3 font-bold font-data text-gray-900">{row.attentive_score}</td>
                    <td className="py-2 px-3 text-gray-700 font-medium">{row.dominant_emotion}</td>
                    <td className="py-2 px-3 text-gray-400 font-data">{row.emotion_confidence}%</td>
                    <td className="py-2 px-3 text-gray-400 font-data">{row.inference_latency_ms}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {activeData.length > 15 && (
            <p className="text-xs text-center text-gray-400 mt-3">
              +{activeData.length - 15} more rows included in export
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
          <span className="text-xs text-gray-400">
            <span className="font-medium text-gray-700">{activeData.length}</span> records ready
          </span>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-700 cursor-pointer transition-colors">
              Cancel
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-sm cursor-pointer"
            >
              {downloaded ? (
                <><Check className="w-3.5 h-3.5" /><span>Saved!</span></>
              ) : (
                <><Download className="w-3.5 h-3.5" /><span>Download CSV</span></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

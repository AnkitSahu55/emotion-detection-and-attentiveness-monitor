import React, { useState } from 'react';
import type { CsvLogEntry } from '../types';
import { generateSampleCsvRows, convertToCsvString, downloadCsvFile } from '../utils/faceLandmarkData';
import { Download, X, FileSpreadsheet, Check, AlertCircle } from 'lucide-react';

interface CsvExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  liveLogs: CsvLogEntry[];
}

export const CsvExportModal: React.FC<CsvExportModalProps> = ({ isOpen, onClose, liveLogs }) => {
  const [downloaded, setDownloaded] = useState(false);
  if (!isOpen) return null;

  const hasRealData = liveLogs.length > 0;
  const activeData = hasRealData ? liveLogs : generateSampleCsvRows(20);

  const handleDownload = () => {
    const csvStr = convertToCsvString(activeData);
    const filename = `faceaware_session_${new Date().toISOString().slice(0, 10)}_${Date.now().toString().slice(-5)}.csv`;
    downloadCsvFile(filename, csvStr);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="csv-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="rounded-2xl max-w-4xl w-full overflow-hidden flex flex-col"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-lg)',
          maxHeight: '85vh',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: 'var(--color-accent-soft)',
                border: '1px solid var(--color-accent-border)',
              }}
            >
              <FileSpreadsheet className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
            </div>
            <div>
              <h2
                id="csv-modal-title"
                className="text-[14px] font-semibold"
                style={{ color: 'var(--color-text)' }}
              >
                Session telemetry export
              </h2>
              <p className="text-[11px] font-data" style={{ color: 'var(--color-text-muted)' }}>
                {activeData.length} frames · RFC 4180 CSV · UTF-8
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors cursor-pointer"
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-surface-raised)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
            }}
            aria-label="Close export dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sample data notice */}
        {!hasRealData && (
          <div
            className="mx-5 mt-4 flex items-start gap-2.5 p-3 rounded-xl text-[12px]"
            style={{
              backgroundColor: 'var(--color-warning-soft)',
              border: '1px solid #fde68a',
              color: 'var(--color-warning)',
            }}
            role="note"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Showing sample data.</strong> No session was recorded — enable the Record button in the
              Live Monitor before stopping monitoring to capture real frames.
            </div>
          </div>
        )}

        {/* Table */}
        <div className="p-5 overflow-y-auto flex-1">
          <div
            className="rounded-xl overflow-x-auto"
            style={{ border: '1px solid var(--color-border)' }}
          >
            <table
              className="w-full text-left text-[12px] border-collapse"
              aria-label="Session telemetry data preview"
            >
              <thead
                style={{
                  backgroundColor: 'var(--color-surface-raised)',
                  borderBottom: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <tr>
                  {['Time', 'Frame', 'EAR avg', 'PERCLOS', 'Blink', 'Yaw°', 'Pitch°', 'Score', 'Emotion', 'Conf', 'Latency'].map((h) => (
                    <th key={h} className="py-2.5 px-3 whitespace-nowrap font-semibold text-[11px]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeData.slice(0, 15).map((row, idx) => (
                  <tr
                    key={idx}
                    style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'var(--color-surface-raised)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'transparent';
                    }}
                  >
                    <td className="py-2 px-3 font-data" style={{ color: 'var(--color-text-muted)' }}>
                      {row.timestamp_utc.slice(11, 23)}
                    </td>
                    <td className="py-2 px-3 font-data font-medium" style={{ color: 'var(--color-text)' }}>
                      {row.frame_id}
                    </td>
                    <td className="py-2 px-3 font-data" style={{ color: 'var(--color-accent)' }}>
                      {row.ear_avg}
                    </td>
                    <td className="py-2 px-3 font-data" style={{ color: 'var(--color-text-secondary)' }}>
                      {row.perclos_pct}%
                    </td>
                    <td className="py-2 px-3">
                      {row.blink_event ? (
                        <span
                          className="px-1.5 py-0.5 rounded text-[10px] font-semibold"
                          style={{
                            backgroundColor: 'var(--color-danger-soft)',
                            color: 'var(--color-danger)',
                          }}
                        >
                          yes
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                      )}
                    </td>
                    <td className="py-2 px-3 font-data" style={{ color: 'var(--color-text-secondary)' }}>
                      {row.head_yaw_deg}°
                    </td>
                    <td className="py-2 px-3 font-data" style={{ color: 'var(--color-text-secondary)' }}>
                      {row.head_pitch_deg}°
                    </td>
                    <td className="py-2 px-3 font-data font-bold" style={{ color: 'var(--color-text)' }}>
                      {row.attentive_score}
                    </td>
                    <td className="py-2 px-3 font-medium" style={{ color: 'var(--color-text)' }}>
                      {row.dominant_emotion}
                    </td>
                    <td className="py-2 px-3 font-data" style={{ color: 'var(--color-text-muted)' }}>
                      {row.emotion_confidence}%
                    </td>
                    <td className="py-2 px-3 font-data" style={{ color: 'var(--color-text-muted)' }}>
                      {row.inference_latency_ms}ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {activeData.length > 15 && (
            <p
              className="text-[11px] text-center mt-3"
              style={{ color: 'var(--color-text-muted)' }}
            >
              +{activeData.length - 15} more rows included in the downloaded file
            </p>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{
            borderTop: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface-raised)',
          }}
        >
          <span className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
            <span className="font-semibold" style={{ color: 'var(--color-text)' }}>
              {activeData.length}
            </span>{' '}
            records · all columns included
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-[12px] font-medium cursor-pointer transition-colors rounded-lg"
              style={{ color: 'var(--color-text-secondary)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-surface-hover)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer shadow-sm"
              style={{
                backgroundColor: 'var(--color-accent)',
                color: '#ffffff',
                border: '1px solid var(--color-accent)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-accent-hover)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-accent)';
              }}
              aria-label={downloaded ? 'File saved' : 'Download CSV file'}
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

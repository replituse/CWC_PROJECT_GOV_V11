import { X, Download } from "lucide-react";
import { useEffect, useRef } from "react";
import { saveAs } from "file-saver";

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  fileName: string;
  type: "inp" | "out";
}

export function FilePreviewModal({ isOpen, onClose, content, fileName, type }: FilePreviewModalProps) {
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (isOpen && preRef.current) {
      preRef.current.scrollTop = 0;
    }
  }, [isOpen, content]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    saveAs(blob, fileName);
  };

  const label = type === "inp" ? "INP" : "OUT";
  const badgeColor = type === "inp"
    ? "bg-blue-100 text-blue-700 border-blue-200"
    : "bg-emerald-100 text-emerald-700 border-emerald-200";

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200"
        style={{ width: "90vw", height: "90vh" }}
      >
        {/* ── Header bar ── */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-3">
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badgeColor}`}
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {label}
            </span>
            <span
              className="text-sm font-semibold text-slate-700 truncate max-w-[400px]"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {fileName}
            </span>
            <span className="text-xs text-slate-400" style={{ fontFamily: "Poppins, sans-serif" }}>
              {content.split("\n").length.toLocaleString()} lines
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-lg transition-colors"
              style={{ fontFamily: "Poppins, sans-serif" }}
              data-testid="btn-preview-download"
            >
              <Download className="w-3.5 h-3.5" />
              Download {label}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors text-slate-500 hover:text-slate-700"
              data-testid="btn-preview-close"
              aria-label="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Content area ── */}
        <div className="flex-1 overflow-auto bg-[#1e1e2e] rounded-b-2xl">
          <pre
            ref={preRef}
            className="text-[13px] leading-relaxed p-5 whitespace-pre text-[#cdd6f4] selection:bg-blue-500/40 min-h-full"
            style={{ fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace' }}
          >
            {content}
          </pre>
        </div>
      </div>
    </div>
  );
}

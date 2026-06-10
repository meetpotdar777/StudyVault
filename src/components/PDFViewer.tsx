import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Search, Eye, Download } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Paper } from "../types";

interface PDFViewerProps {
  paper: Paper;
  onDownload: () => void;
}

export default function PDFViewer({ paper, onDownload }: PDFViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [searchTerm, setSearchTerm] = useState("");

  const pageParagraphs = useMemo(() => {
    // Split the textContent into virtual pages based on explicit delimiters or paragraphs
    const paragraphs = paper.textContent.split("\n\n").filter(p => p.trim().length > 0);
    // Group paragraphs into virtual pages (approx 2 paragraphs per page)
    const pages: string[][] = [];
    for (let i = 0; i < paragraphs.length; i += 2) {
      pages.push(paragraphs.slice(i, i + 2));
    }
    return pages.length > 0 ? pages : [["No content available."]];
  }, [paper.textContent]);

  const totalPages = pageParagraphs.length;

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleZoomIn = () => {
    if (zoom < 150) setZoom((prev) => prev + 15);
  };

  const handleZoomOut = () => {
    if (zoom > 75) setZoom((prev) => prev - 15);
  };

  // Helper to highlight searched term in a paragraph
  const highlightText = (text: string, search: string) => {
    if (!search.trim()) return text;
    const regex = new RegExp(`(${search.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <span key={index} className="bg-amber-100 text-amber-950 font-semibold px-0.5 rounded shadow-xs">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl" id="pdf-view-container">
      {/* Top Toolbar */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        {/* Document Label */}
        <div className="flex items-center gap-2">
          <div className="bg-indigo-900/50 text-indigo-400 p-1.5 rounded-lg border border-indigo-500/20">
            <Eye className="w-4.5 h-4.5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200 line-clamp-1">{paper.title}</h4>
            <p className="text-xs text-slate-400">Preview Simulator Mode • High Fidelity</p>
          </div>
        </div>

        {/* Zoom & Navigation Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg px-2 py-1">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 75}
              className="text-slate-400 hover:text-white hover:bg-slate-800 p-1 rounded-sm disabled:opacity-40 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-slate-300 w-12 text-center select-none">
              {zoom}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 150}
              className="text-slate-400 hover:text-white hover:bg-slate-800 p-1 rounded-sm disabled:opacity-40 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 gap-1">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="text-slate-400 hover:text-white hover:bg-slate-800 p-1 rounded-md disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-4.5 h-4.5" />
            </button>
            <span className="text-xs font-medium text-slate-300 px-2 min-w-[70px] text-center select-none">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="text-slate-400 hover:text-white hover:bg-slate-800 p-1 rounded-md disabled:opacity-30 transition-all"
            >
              <ChevronRight className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Search Inside & Download Button */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Find in page..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-xs rounded-lg pl-8 pr-2 py-1.5 w-36 text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>
          <button
            onClick={onDownload}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium shadow-md transition-all cursor-pointer"
            id="pdf-download-btn"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="bg-slate-950 p-6 md:p-8 flex justify-center items-start min-h-[460px] max-h-[600px] overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
            className="w-full max-w-2xl bg-white text-slate-900 rounded-lg p-8 md:p-12 shadow-2xl relative border border-slate-200 select-text transition-all duration-200"
          >
            {/* Academic Page Header Decoration */}
            <div className="border-b-2 border-double border-slate-300 pb-3 mb-6 flex justify-between items-center text-slate-500 font-serif text-[10px] uppercase tracking-wider select-none">
              <span>StudyVault Community Resource • {paper.subjectCode || "EXAM"}</span>
              <span>Year {paper.year}</span>
            </div>

            {/* Document Content */}
            <div className="space-y-6 font-mono text-xs leading-relaxed text-left">
              {pageParagraphs[currentPage - 1]?.map((paragraph, idx) => (
                <p key={idx} className="whitespace-pre-wrap">
                  {highlightText(paragraph, searchTerm)}
                </p>
              ))}
            </div>

            {/* Simulated Watermark background */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-3 select-none">
              <span className="text-3xl font-bold font-sans rotate-45 border border-dashed border-slate-900 p-4">STUDYVAULT VERIFIED</span>
            </div>

            {/* Bottom Margin Footer Decoration */}
            <div className="mt-12 pt-4 border-t border-slate-200 flex justify-between items-center text-slate-400 font-serif text-[9px] select-none">
              <span>Page {currentPage} of {totalPages}</span>
              <span>Uploader Reputation: Rank #{paper.uploaderRep}</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Footer Info bar */}
      <div className="bg-slate-950 border-t border-slate-800 px-4 py-2 flex justify-between text-[11px] text-slate-400">
        <span>🔒 Authentic Document Preview • Peer Reviewed</span>
        <span className="font-mono">{paper.downloadCount} Total Downloads</span>
      </div>
    </div>
  );
}

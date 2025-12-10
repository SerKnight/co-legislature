"use client";

import { useState, useEffect, Suspense, type ReactNode } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Scale,
  FileText,
  Loader2,
  X,
  ChevronDown,
  ArrowLeft,
  Info,
  ChevronUp,
  Sparkles,
  Bot,
  ChevronRight,
  ChevronLeft,
  List,
} from "lucide-react";

interface SearchResult {
  id: string;
  uuid: string;
  title: string;
  chunk: string;
  searchableText: string;
  pageNumber: number;
  chunkNumber: number;
  pdfFileName: string;
  mediaItemRid: string;
  timestamp: string;
}

interface SearchResponse {
  query: string;
  count: number;
  results: SearchResult[];
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [showMatchedText, setShowMatchedText] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [resultLimit, setResultLimit] = useState(5);
  const [showLimitTooltip, setShowLimitTooltip] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [showSummaryPanel, setShowSummaryPanel] = useState(true);

  // New: pane visibility states for Results and PDF Viewer
  const [showResultsPane, setShowResultsPane] = useState(true);
  const [showPdfPane, setShowPdfPane] = useState(true);

  // Responsive initial state: on small screens collapse side panels by default
  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window.innerWidth;
    setShowResultsPane(w >= 1024); // show results on >= lg
    setShowPdfPane(true); // keep PDF viewer open by default
    setShowSummaryPanel(w >= 1280); // show AI summary on xl+
  }, []);

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, []);

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    router.replace(`/search?q=${encodeURIComponent(q.trim())}`, { scroll: false });

    setIsLoading(true);
    setError(null);
    setSelectedResult(null);
    setHasSearched(true);
    setAiSummary(null);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=${resultLimit}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || "Search failed");
      }

      const data: SearchResponse = await response.json();
      setResults(data.results);
      if (data.results.length > 0) {
        setSelectedResult(data.results[0]);
        fetchAiSummary(q, data.results);
        // ensure PDF pane visible when selecting a result
        setShowPdfPane(true);
      }
      // ensure results pane visible when search returns results
      setShowResultsPane(true);
    } catch (err) {
      setError("Failed to search. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    setSelectedResult(result);
    setShowMatchedText(false);
    setShowPdfPane(true);
  };

  // Fetch AI summary
  const fetchAiSummary = async (query: string, results: SearchResult[]) => {
    setIsSummaryLoading(true);
    setAiSummary(null);
    
    try {

      const searchResultChunks = results.map((chunk) => chunk.chunk)

      const response = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, searchResultChunks }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiSummary(data.summary);
      }
    } catch (error) {
      console.error("Failed to fetch AI summary:", error);
    } finally {
      setIsSummaryLoading(false);
    }
  };

  // Enhanced markdown renderer with better formatting
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: ReactNode[] = [];
    let inList = false;
    let listItems: string[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let inTable = false;
    let tableRows: string[][] = [];

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-1 mb-4 text-slate-300 ml-2">
            {listItems.map((item, i) => <li key={i} className="leading-relaxed">{formatInline(item)}</li>)}
          </ul>
        );
        listItems = [];
      }
      inList = false;
    };

    const flushCodeBlock = () => {
      if (codeBlockContent.length > 0) {
        elements.push(
          <pre key={`code-${elements.length}`} className="bg-slate-900 border border-slate-700 rounded-lg p-4 mb-4 overflow-x-auto">
            <code className="text-amber-300 text-xs font-mono leading-relaxed">
              {codeBlockContent.join('\n')}
            </code>
          </pre>
        );
        codeBlockContent = [];
      }
      inCodeBlock = false;
    };

    const flushTable = () => {
      if (tableRows.length > 0) {
        elements.push(
          <div key={`table-${elements.length}`} className="overflow-x-auto mb-4">
            <table className="min-w-full border-collapse border border-slate-600">
              <tbody>
                {tableRows.map((row, rowIdx) => (
                  <tr key={rowIdx} className={rowIdx === 0 ? "bg-slate-700/50" : "bg-slate-800/30"}>
                    {row.map((cell, cellIdx) => (
                      <td
                        key={cellIdx}
                        className="border border-slate-600 px-3 py-2 text-xs text-slate-300"
                      >
                        {formatInline(cell.trim())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
      }
      inTable = false;
    };

    const formatInline = (text: string) => {
      // Bold
      text = text.replace(/\*\*(.+?)\*\*/g, '<strong class="text-slate-100 font-semibold">$1</strong>');
      // Italic
      text = text.replace(/\*(.+?)\*/g, '<em class="text-slate-200 italic">$1</em>');
      // Inline code
      text = text.replace(/`(.+?)`/g, '<code class="bg-slate-700 px-1.5 py-0.5 rounded text-amber-300 text-xs font-mono">$1</code>');
      // Links
      text = text.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-amber-400 hover:text-amber-300 underline">$1</a>');
      return <span dangerouslySetInnerHTML={{ __html: text }} />;
    };

    lines.forEach((line, i) => {
      const trimmed = line.trim();
      
      // Code blocks (```)
      if (trimmed.startsWith('```')) {
        if (inCodeBlock) {
          flushCodeBlock();
        } else {
          flushList();
          flushTable();
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }

      // Horizontal rule
      if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
        flushList();
        flushTable();
        elements.push(<hr key={`hr-${elements.length}`} className="my-4 border-t border-slate-700" />);
        return;
      }

      // Headers
      if (trimmed.startsWith('# ')) {
        flushList();
        flushTable();
        elements.push(<h2 key={i} className="text-2xl font-bold text-white mt-6 mb-3">{trimmed.slice(2)}</h2>);
      } else if (trimmed.startsWith('## ')) {
        flushList();
        flushTable();
        elements.push(<h3 key={i} className="text-xl font-bold text-slate-100 mt-5 mb-2">{trimmed.slice(3)}</h3>);
      } else if (trimmed.startsWith('### ')) {
        flushList();
        flushTable();
        elements.push(<h4 key={i} className="text-lg font-semibold text-slate-200 mt-4 mb-2">{trimmed.slice(4)}</h4>);
      } else if (trimmed.startsWith('#### ')) {
        flushList();
        flushTable();
        elements.push(<h5 key={i} className="text-base font-semibold text-slate-200 mt-3 mb-2">{trimmed.slice(5)}</h5>);
      }
      // Blockquote
      else if (trimmed.startsWith('> ')) {
        flushList();
        flushTable();
        elements.push(
          <blockquote key={i} className="border-l-4 border-amber-500 pl-4 py-2 mb-3 italic text-slate-300 bg-slate-900/30 rounded">
            {formatInline(trimmed.slice(2))}
          </blockquote>
        );
      }
      // Table rows
      else if (trimmed.includes('|')) {
        if (!inTable) {
          inTable = true;
        }
        const cells = trimmed.split('|').slice(1, -1); // Remove empty first and last elements
        // Skip separator rows
        if (!cells.every(cell => /^-+$/.test(cell.trim()))) {
          tableRows.push(cells);
        }
      }
      // Unordered list items
      else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        inList = true;
        listItems.push(trimmed.slice(2));
      }
      // Ordered list items
      else if (/^\d+\.\s/.test(trimmed)) {
        inList = true;
        listItems.push(trimmed.replace(/^\d+\.\s/, ''));
      }
      // Empty line
      else if (trimmed === '') {
        flushList();
        if (inTable) {
          flushTable();
        }
        // Don't add extra spacing for consecutive empty lines
      }
      // Regular paragraph
      else {
        flushList();
        flushTable();
        elements.push(<p key={i} className="text-slate-300 mb-3 leading-relaxed">{formatInline(trimmed)}</p>);
      }
    });

    // Flush any remaining content
    flushList();
    flushCodeBlock();
    flushTable();

    return elements;
  };

  // Clean searchable text - just normalize whitespace, keep the actual text
  const cleanSearchText = (text: string) => {
    return text
      .replace(/\r\n/g, " ")
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  // Build PDF viewer URL with page and searchable text
  // URL length limit ~2000 chars, so we pass first 800 chars (expands when encoded)
  const getPdfUrl = (result: SearchResult) => {
    const cleanedText = cleanSearchText(result.searchableText);
    const searchText = cleanedText.slice(0, 800);
    const pdfPath = encodeURIComponent(`/api/pdf/${result.uuid}`);
    const search = encodeURIComponent(searchText);
    return `/pdfviewer.html?file=${pdfPath}&search=${search}#page=${result.pageNumber}`;
  };

  const parseChunkMetadata = (chunk: string) => {
    const match = chunk.match(/\[SRC:\s*([^\]]+)\]/);
    if (match) {
      const parts = match[1].split("|").map((p) => p.trim());
      return {
        section: parts.find((p) => p.startsWith("SEC:"))?.replace("SEC:", "").trim(),
        article: parts.find((p) => p.startsWith("ART:"))?.replace("ART:", "").trim(),
      };
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm sticky top-0 z-20 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/"
              className="flex items-center gap-1 sm:gap-2 text-slate-400 hover:text-white transition-colors flex-shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                  <Scale className="w-4 h-4 sm:w-5 sm:h-5 text-slate-900" />
                </div>
                <span className="font-semibold hidden md:inline">Colorado Law</span>
              </div>
            </Link>

            <div className="flex-1 flex gap-2 min-w-0">
              <div className="relative flex-1">
                <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Search..."
                  className="w-full pl-8 sm:pl-10 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                />
              </div>
              
              {/* Result Limit Selector */}
              <div className="relative flex-shrink-0">
                <div 
                  className="flex items-center h-full"
                  onMouseEnter={() => setShowLimitTooltip(true)}
                  onMouseLeave={() => setShowLimitTooltip(false)}
                >
                  <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg h-full">
                    <button
                      onClick={() => setResultLimit(Math.max(1, resultLimit - 1))}
                      className="px-2 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-l-lg transition-colors cursor-pointer"
                      aria-label="Decrease results"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <div className="px-2 py-2 text-sm text-slate-300 min-w-[3rem] text-center border-x border-slate-700 flex items-center justify-center gap-1">
                      <span className="font-medium">{resultLimit}</span>
                      <Info className="w-3 h-3 text-slate-500" />
                    </div>
                    <button
                      onClick={() => setResultLimit(Math.min(25, resultLimit + 1))}
                      className="px-2 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-r-lg transition-colors cursor-pointer"
                      aria-label="Increase results"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Tooltip */}
                {showLimitTooltip && (
                  <div className="absolute top-full right-0 mt-2 w-72 p-3 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-50 text-xs">
                    <div className="flex items-start gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                        <Search className="w-3 h-3 text-amber-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-200 mb-1">Semantic Search Results</p>
                        <p className="text-slate-400 leading-relaxed">
                          This controls how many results to show. Unlike keyword search, semantic search understands 
                          <span className="text-amber-400"> meaning</span> — so "car accident" also finds "vehicle collision" 
                          even without matching words.
                        </p>
                      </div>
                    </div>
                    <div className="border-t border-slate-700 pt-2 mt-2">
                      <p className="text-slate-500">
                        Results are ranked by how closely they match your question's intent, not just keywords.
                      </p>
                    </div>
                    <div className="absolute -top-2 right-8 w-3 h-3 bg-slate-800 border-l border-t border-slate-600 transform rotate-45"></div>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleSearch()}
                disabled={isLoading || !query.trim()}
                className="px-3 sm:px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 font-medium rounded-lg transition-colors flex items-center gap-2 text-sm flex-shrink-0 cursor-pointer"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-screen-3xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-6 xl:px-6 flex flex-col">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center flex-1">
            <div className="flex items-center gap-3 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Searching Colorado statutes...</span>
            </div>
          </div>
        )}

        {!isLoading && hasSearched && results.length === 0 && (
          <div className="text-center flex-1 flex flex-col items-center justify-center">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-300 mb-2">No results found</h3>
            <p className="text-slate-500">Try rephrasing your question or using different keywords.</p>
          </div>
        )}

        {!isLoading && results.length > 0 && (
          <div className="flex flex-col xl:flex-row gap-4 flex-1 min-h-0">
            {/* Results Pane */}
            <div className={`transition-all duration-300 flex flex-col ${
              showResultsPane 
                ? "w-full xl:w-72 xl:flex-shrink-0" 
                : "w-full xl:w-16 xl:flex-shrink-0"
            }`}>
              {showResultsPane ? (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden h-full flex flex-col">
                  {/* Header with only collapse action */}
                  <div className="p-3 border-b border-slate-700 bg-slate-800/80 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <List className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-slate-100 truncate">Results</h3>
                        <p className="text-xs text-slate-400">
                          <span className="text-amber-400">{results.length}</span> matches
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowResultsPane(false)}
                      title="Collapse results"
                      className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-100 transition-colors flex-shrink-0 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Results list */}
                  <div className="flex-1 space-y-2 overflow-y-auto p-3 pr-2">
                    {results.map((result, i) => {
                      const meta = parseChunkMetadata(result.chunk);
                      const isSelected = selectedResult?.id === result.id;

                      return (
                        <button
                          key={result.id}
                          onClick={() => handleSelectResult(result)}
                          className={`w-full text-left p-2 sm:p-3 rounded-lg border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/10"
                              : "bg-slate-800/50 border-slate-700 hover:border-slate-600 hover:bg-slate-700/30"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div
                              className={`w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                isSelected ? "bg-amber-500 text-slate-900" : "bg-slate-700 text-slate-400"
                              }`}
                            >
                              {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-sm text-slate-200 line-clamp-2 mb-1">
                                {result.title}
                              </h3>
                              <div className="flex flex-wrap gap-1 text-xs">
                                {meta?.section && (
                                  <span className="px-1.5 py-0.5 bg-slate-700/50 rounded text-slate-400">
                                    § {meta.section}
                                  </span>
                                )}
                                <span className="px-1.5 py-0.5 bg-slate-700/50 rounded text-slate-400">
                                  p.{result.pageNumber}
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                // Collapsed state: compact sidebar
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden flex flex-col items-center justify-start pt-3 gap-3">
                  <button
                    onClick={() => setShowResultsPane(true)}
                    title={`Results (${results.length})`}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-700/50 hover:bg-slate-700 text-amber-400 transition-colors cursor-pointer"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <div className="w-6 h-px bg-slate-700"></div>
                  <span className="text-xs text-slate-500 pb-2">{results.length}</span>
                </div>
              )}
            </div>

            {/* PDF Viewer Pane */}
            <div className={`transition-all duration-300 flex flex-col min-h-0 ${
              showPdfPane 
                ? "flex-1 xl:min-w-[400px]" 
                : "w-full xl:w-16 xl:flex-shrink-0"
            }`}>
              {showPdfPane ? (
                selectedResult ? (
                  <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden h-full flex flex-col">
                    {/* Header */}
                    <div className="p-2 sm:p-3 border-b border-slate-700 bg-slate-800/80 flex items-center justify-between flex-shrink-0">
                      <div className="flex-1 min-w-0 mr-2">
                        <h3 className="font-semibold text-xs sm:text-sm text-slate-100 truncate">
                          {selectedResult.title}
                        </h3>
                        <p className="text-xs text-slate-400 truncate">
                          {selectedResult.pdfFileName} • Page {selectedResult.pageNumber}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => setShowPdfPane(false)}
                          title="Collapse viewer"
                          className="p-1 sm:p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedResult(null)}
                          title="Clear selection"
                          className="p-1 sm:p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Matched text toggle */}
                    <button
                      onClick={() => setShowMatchedText(!showMatchedText)}
                      className="w-full p-2 border-b border-slate-700 bg-slate-900/30 text-xs text-slate-400 hover:text-slate-300 hover:bg-slate-900/50 flex items-center justify-between px-2 sm:px-3 transition-colors flex-shrink-0 cursor-pointer"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <FileText className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">Matched text</span>
                      </span>
                      <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${showMatchedText ? "rotate-180" : ""}`} />
                    </button>

                    {/* Matched text content */}
                    {showMatchedText && (
                      <div className="p-3 border-b border-slate-700 bg-slate-900/50 overflow-y-auto max-h-32 flex-shrink-0">
                        <p className="text-xs text-slate-300 leading-relaxed font-mono">
                          {cleanSearchText(selectedResult.searchableText)}
                        </p>
                      </div>
                    )}

                    {/* PDF iframe */}
                    <div className="bg-slate-900 flex-1 min-h-0">
                      <iframe
                        src={getPdfUrl(selectedResult)}
                        className="w-full h-full border-0 block min-h-[800px]"
                        title={`PDF: ${selectedResult.title}`}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-800/30 border border-slate-700 border-dashed rounded-xl p-8 xl:p-12 text-center flex items-center justify-center h-full">
                    <div>
                      <FileText className="w-10 h-10 xl:w-12 xl:h-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-500 text-sm xl:text-base">Select a result to view the document</p>
                    </div>
                  </div>
                )
              ) : (
                // Collapsed state
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden flex flex-col items-center justify-start pt-3 gap-3">
                  <button
                    onClick={() => setShowPdfPane(true)}
                    title="Open document viewer"
                    className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                      selectedResult
                        ? "bg-amber-500/20 hover:bg-amber-500/30 text-amber-400"
                        : "bg-slate-700/50 hover:bg-slate-700 text-slate-400"
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                  <div className="w-6 h-px bg-slate-700"></div>
                </div>
              )}
            </div>

            {/* AI Summary Pane */}
            <div className={`transition-all duration-300 flex flex-col min-h-0 h-screen ${
              showSummaryPanel 
                ? "flex-1 xl:min-w-[300px]" 
                : "w-full xl:w-16 xl:flex-shrink-0"
            }`}>
              {showSummaryPanel ? (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden h-full flex flex-col">
                  {/* Header */}
                  <div className="p-3 border-b border-slate-700 bg-gradient-to-r from-amber-500/10 to-orange-500/10 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-amber-500/20">
                        <Bot className="w-4 h-4 text-amber-400" />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-100">AI Summary</h3>
                    </div>
                    <button
                      onClick={() => setShowSummaryPanel(false)}
                      title="Collapse summary"
                      className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4 overflow-y-auto max-h-[calc(100vh-200px)]">
                    {isSummaryLoading ? (
                      <div className="flex flex-col items-center justify-center py-8 gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 border-2 border-amber-500/30 rounded-full" />
                          <div className="absolute inset-0 w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                          <Sparkles className="absolute inset-0 m-auto w-4 h-4 text-amber-400" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-slate-300">Analyzing results...</p>
                          <p className="text-xs text-slate-500 mt-1">Generating legal summary</p>
                        </div>
                      </div>
                    ) : aiSummary ? (
                      <div className="text-sm">
                        {renderMarkdown(aiSummary)}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Bot className="w-8 h-8 text-slate-600 mb-3" />
                        <p className="text-sm text-slate-500">
                          AI summary will appear here after searching
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer hint */}
                  {aiSummary && (
                    <div className="px-4 py-2 border-t border-slate-700 bg-slate-900/50 flex-shrink-0">
                      <p className="text-xs text-slate-500 flex items-center gap-1.5">
                        <Info className="w-3 h-3" />
                        AI-generated summary. Verify with source documents.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                // Collapsed state: vertical sidebar
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden flex flex-col items-center justify-start pt-3 gap-3">
                  <button
                    onClick={() => setShowSummaryPanel(true)}
                    title="Open AI summary"
                    className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                      aiSummary
                        ? "bg-amber-500/20 hover:bg-amber-500/30 text-amber-400"
                        : "bg-slate-700/50 hover:bg-slate-700 text-slate-400"
                    }`}
                  >
                    <Bot className="w-4 h-4" />
                  </button>
                  <div className="w-6 h-px bg-slate-700"></div>
                </div>
              )}
            </div>
          </div>
        )}

        {!isLoading && !hasSearched && (
          <div className="text-center flex-1 flex flex-col items-center justify-center">
            <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-300 mb-2">Enter a search query</h3>
            <p className="text-slate-500">Search Colorado Revised Statutes in plain English</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
"use client";

import { useState, useEffect, Suspense } from "react";
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

  // Run search on mount if query exists
  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, []);

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    // Update URL
    router.replace(`/search?q=${encodeURIComponent(q.trim())}`, { scroll: false });

    setIsLoading(true);
    setError(null);
    setSelectedResult(null);
    setHasSearched(true);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=15`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || "Search failed");
      }

      const data: SearchResponse = await response.json();
      setResults(data.results);
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
  };

  // Build PDF viewer URL with page and search
  const getPdfUrl = (result: SearchResult) => {
    const searchText = result.searchableText
      .replace(/\r\n/g, " ")
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 50);

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
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                  <Scale className="w-5 h-5 text-slate-900" />
                </div>
                <span className="font-semibold hidden sm:inline">Colorado Law</span>
              </div>
            </Link>

            {/* Search Box */}
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1 max-w-2xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Search Colorado law..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                />
              </div>
              <button
                onClick={() => handleSearch()}
                disabled={isLoading || !query.trim()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 font-medium rounded-lg transition-colors flex items-center gap-2 text-sm"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
            {error}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Searching Colorado statutes...</span>
            </div>
          </div>
        )}

        {/* No Results */}
        {!isLoading && hasSearched && results.length === 0 && (
          <div className="text-center py-20">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-300 mb-2">No results found</h3>
            <p className="text-slate-500">Try rephrasing your question or using different keywords.</p>
          </div>
        )}

        {/* Results */}
        {!isLoading && results.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Results List */}
            <div className="lg:col-span-1">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-400">
                  <span className="text-amber-400 font-semibold">{results.length}</span> results
                </p>
              </div>

              <div className="space-y-2 max-h-[calc(100vh-180px)] overflow-y-auto pr-2">
                {results.map((result, i) => {
                  const meta = parseChunkMetadata(result.chunk);
                  const isSelected = selectedResult?.id === result.id;

                  return (
                    <button
                      key={result.id}
                      onClick={() => handleSelectResult(result)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        isSelected
                          ? "bg-amber-500/10 border-amber-500/50"
                          : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold flex-shrink-0 ${
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

            {/* PDF Viewer */}
            <div className="lg:col-span-2 lg:sticky lg:top-20 lg:self-start">
              {selectedResult ? (
                <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                  {/* Header */}
                  <div className="p-3 border-b border-slate-700 bg-slate-800/80 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-slate-100 truncate">
                        {selectedResult.title}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {selectedResult.pdfFileName} • Page {selectedResult.pageNumber}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedResult(null)}
                      className="p-1.5 hover:bg-slate-700 rounded ml-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Collapsible Matched Text */}
                  <button
                    onClick={() => setShowMatchedText(!showMatchedText)}
                    className="w-full p-2 border-b border-slate-700 bg-slate-900/30 text-xs text-slate-400 hover:text-slate-300 hover:bg-slate-900/50 flex items-center justify-between px-3"
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="w-3 h-3" />
                      Matched text
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showMatchedText ? "rotate-180" : ""}`} />
                  </button>

                  {showMatchedText && (
                    <div className="p-3 border-b border-slate-700 bg-slate-900/50">
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {selectedResult.searchableText
                          .replace(/\r\n/g, " ")
                          .replace(/\n/g, " ")
                          .replace(/\s+/g, " ")
                          .trim()}
                      </p>
                    </div>
                  )}

                  {/* PDF Viewer */}
                  <div className="bg-slate-900" style={{ height: "70vh" }}>
                    <iframe
                      src={getPdfUrl(selectedResult)}
                      className="w-full h-full border-0"
                      title={`PDF: ${selectedResult.title}`}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-slate-800/30 border border-slate-700 border-dashed rounded-xl p-12 text-center">
                  <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500">Select a result to view the source document</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Initial State */}
        {!isLoading && !hasSearched && (
          <div className="text-center py-20">
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
"use client";

import { useState } from "react";
import { Search, Scale, FileText, ChevronRight, BookOpen, Loader2, ExternalLink } from "lucide-react";

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

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);

  const exampleQuestions = [
    { text: "What are the rules about carrying firearms near polling places?", category: "Elections" },
    { text: "How does eminent domain work in Colorado?", category: "Property" },
    { text: "What are my rights if I'm arrested?", category: "Criminal" },
    { text: "How are property taxes calculated?", category: "Taxes" },
  ];

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    setIsLoading(true);
    setError(null);
    setSelectedResult(null);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=15`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API Error:", errorData);
        throw new Error(errorData.details || "Search failed");
      }
      if (!response.ok) throw new Error("Search failed");
      
      const data: SearchResponse = await response.json();
      setResults(data.results);
      setHasSearched(true);
    } catch (err) {
      setError("Failed to search. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const parseChunkMetadata = (chunk: string) => {
    // Parse the [SRC: ...] header from chunk text
    const match = chunk.match(/\[SRC:\s*([^\]]+)\]/);
    if (match) {
      const parts = match[1].split("|").map((p) => p.trim());
      return {
        source: parts[0],
        page: parts.find((p) => p.startsWith("PAGE:"))?.replace("PAGE:", "").trim(),
        doc: parts.find((p) => p.startsWith("DOC:"))?.replace("DOC:", "").trim(),
        article: parts.find((p) => p.startsWith("ART:"))?.replace("ART:", "").trim(),
        section: parts.find((p) => p.startsWith("SEC:"))?.replace("SEC:", "").trim(),
        subject: parts.find((p) => p.startsWith("SUBJ:"))?.replace("SUBJ:", "").trim(),
      };
    }
    return null;
  };

  const getCleanText = (chunk: string) => {
    // Remove the [SRC: ...] header and clean up
    return chunk.replace(/\[SRC:[^\]]+\]\r?\n?/, "").trim();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
              <Scale className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Colorado Law Search</h1>
              <p className="text-xs text-slate-400">Semantic search across CRS 2025</p>
            </div>
          </div>
          <span className="text-xs text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
            Beta
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Hero - only show when no search */}
        {!hasSearched && (
          <div className="text-center mb-12 pt-8">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Search Colorado Law in Plain English
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Ask any question about Colorado statutes. Our AI-powered semantic search
              finds the most relevant sections across thousands of legal documents.
            </p>
          </div>
        )}

        {/* Search Box */}
        <div className="mb-8">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Ask a question about Colorado law..."
                className="w-full pl-12 pr-4 py-4 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={isLoading || !query.trim()}
              className="px-8 py-4 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 font-semibold rounded-xl transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Searching
                </>
              ) : (
                "Search"
              )}
            </button>
          </div>
        </div>

        {/* Example Questions - only show when no search */}
        {!hasSearched && (
          <div className="mb-12">
            <p className="text-sm text-slate-500 mb-4">Try asking:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {exampleQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQuery(q.text);
                    handleSearch(q.text);
                  }}
                  className="flex items-center gap-4 p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-amber-500/50 hover:bg-slate-800 transition-all text-left group"
                >
                  <div className="w-10 h-10 bg-slate-700 group-hover:bg-amber-500/20 rounded-lg flex items-center justify-center transition-colors">
                    <BookOpen className="w-5 h-5 text-slate-400 group-hover:text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 font-medium truncate">{q.text}</p>
                    <p className="text-xs text-slate-500">{q.category}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-amber-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
            {error}
          </div>
        )}

        {/* Results */}
        {hasSearched && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Results List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-400">
                  Found <span className="text-amber-400 font-semibold">{results.length}</span> relevant sections
                </p>
                <button
                  onClick={() => {
                    setHasSearched(false);
                    setResults([]);
                    setQuery("");
                    setSelectedResult(null);
                  }}
                  className="text-sm text-amber-400 hover:text-amber-300"
                >
                  New search
                </button>
              </div>

              <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-2">
                {results.map((result, i) => {
                  const meta = parseChunkMetadata(result.chunk);
                  const isSelected = selectedResult?.id === result.id;

                  return (
                    <button
                      key={result.id}
                      onClick={() => setSelectedResult(result)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        isSelected
                          ? "bg-amber-500/10 border-amber-500/50"
                          : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                          isSelected ? "bg-amber-500 text-slate-900" : "bg-slate-700 text-slate-400"
                        }`}>
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-200 mb-1 line-clamp-2">
                            {result.title}
                          </h3>
                          <div className="flex flex-wrap gap-2 text-xs">
                            {meta?.section && (
                              <span className="px-2 py-0.5 bg-slate-700 rounded text-slate-400">
                                § {meta.section}
                              </span>
                            )}
                            {result.pdfFileName && (
                              <span className="px-2 py-0.5 bg-slate-700 rounded text-slate-400">
                                {result.pdfFileName}
                              </span>
                            )}
                            {result.pageNumber && (
                              <span className="px-2 py-0.5 bg-slate-700 rounded text-slate-400">
                                Page {result.pageNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detail Panel */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              {selectedResult ? (
                <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-slate-700 bg-slate-800/80">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-lg text-slate-100 mb-2">
                          {selectedResult.title}
                        </h3>
                        {(() => {
                          const meta = parseChunkMetadata(selectedResult.chunk);
                          return meta ? (
                            <div className="flex flex-wrap gap-2 text-xs">
                              {meta.section && (
                                <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded">
                                  Section {meta.section}
                                </span>
                              )}
                              {meta.article && (
                                <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded">
                                  Article {meta.article}
                                </span>
                              )}
                              {meta.subject && (
                                <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded">
                                  {meta.subject}
                                </span>
                              )}
                            </div>
                          ) : null;
                        })()}
                      </div>
                      <FileText className="w-6 h-6 text-amber-400 flex-shrink-0" />
                    </div>
                  </div>
                  
                  <div className="p-4 max-h-[60vh] overflow-y-auto">
                    <div className="prose prose-invert prose-sm max-w-none">
                      <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {getCleanText(selectedResult.chunk)}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 border-t border-slate-700 bg-slate-800/80">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>
                        {selectedResult.pdfFileName} • Page {selectedResult.pageNumber}
                      </span>
                      <span>Chunk #{selectedResult.chunkNumber}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-800/30 border border-slate-700 border-dashed rounded-xl p-12 text-center">
                  <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500">Select a result to view details</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-12 p-4 bg-slate-800/30 rounded-xl border border-slate-700">
          <p className="text-xs text-slate-500 text-center">
            <span className="font-semibold text-slate-400">Disclaimer:</span> This tool provides access to Colorado legal documents for informational purposes only. 
            It is not legal advice. For legal matters, please consult a licensed attorney.
          </p>
        </div>
      </main>
    </div>
  );
}
// app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { palantirClient } from "@/lib/palantir";
import { ColoradoLegislatureChunks } from "@colorado-legislature-explorer/sdk";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const limit = parseInt(searchParams.get("limit") || "10");

  if (!query) {
    return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
  }

  try {
    console.log("Searching for:", query, "limit:", limit);
    
    // Semantic search using vector embeddings
    const result = await palantirClient(ColoradoLegislatureChunks)
      .nearestNeighbors(query, limit, "embedding")
      .fetchPage();
    
    console.log("Got results:", result.data.length);

    // Transform results for the frontend
    const chunks = result.data.map((chunk) => ({
      id: chunk.$primaryKey,
      uuid: chunk.uuid,
      title: chunk.summary || "Untitled Section",
      chunk: chunk.chunk,
      searchableText: chunk.searchableText,
      pageNumber: chunk.pageNumber,
      chunkNumber: chunk.chunkNumber,
      pdfFileName: chunk.pdfFileName,
      mediaItemRid: chunk.mediaItemRid,
      timestamp: chunk.timestamp,
    }));

    return NextResponse.json({ 
      query,
      count: chunks.length,
      results: chunks 
    });
  } catch (error: any) {
    console.error("Search error:", error);
    return NextResponse.json(
      { 
        error: "Search failed", 
        details: error?.message || String(error),
        name: error?.name,
        cause: error?.cause 
      },
      { status: 500 }
    );
  }
}
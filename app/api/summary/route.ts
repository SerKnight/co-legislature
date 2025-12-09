// app/api/summary/route.ts
import { NextRequest, NextResponse } from "next/server";
import { palantirClient } from "@/lib/palantir";
import { aiSummaryColoradoLegalSearch } from "@colorado-legislature-explorer/sdk";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, searchResultChunks } = body;

    if (!query || !searchResultChunks) {
      return NextResponse.json(
        { error: "Missing query or searchResultChunks" },
        { status: 400 }
      );
    }

    console.log('searchResultChunks: ',searchResultChunks)

    const result = await palantirClient(aiSummaryColoradoLegalSearch).executeFunction({
      searchResultChunks,
      query,
    });

    return NextResponse.json({ summary: result });
  } catch (error: any) {
    console.error("AI Summary error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate summary",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
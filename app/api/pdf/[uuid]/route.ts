// app/api/pdf/[uuid]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { palantirClient } from "@/lib/palantir";
import { ColoradoLegislatureChunks } from "@colorado-legislature-explorer/sdk";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  const { uuid } = await params;

  if (!uuid) {
    return NextResponse.json({ error: "Missing uuid" }, { status: 400 });
  }

  try {
    console.log("Fetching PDF for chunk:", uuid);

    // Fetch the chunk by primary key
    const chunk = await palantirClient(ColoradoLegislatureChunks).fetchOne(uuid);

    if (!chunk.mediaReference) {
      return NextResponse.json({ error: "No media reference found" }, { status: 404 });
    }

    // Fetch the PDF content
    const mediaContent = await chunk.mediaReference.fetchContents();

    if (!mediaContent?.ok) {
      return NextResponse.json({ error: "Failed to fetch PDF content" }, { status: 500 });
    }

    // Get the blob data
    const blob = await mediaContent.blob();
    const arrayBuffer = await blob.arrayBuffer();

    // Return the PDF with proper headers
    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${chunk.pdfFileName || "document.pdf"}"`,
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error: any) {
    console.error("PDF fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch PDF",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
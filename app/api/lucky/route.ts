// app/api/lucky/route.ts
import { NextResponse } from "next/server";
import { palantirClient } from "@/lib/palantir";
import { feelingLucky } from "@colorado-legislature-explorer/sdk";

export async function POST() {
  try {
    const result = await palantirClient(feelingLucky).executeFunction();
    
    return NextResponse.json({ 
      query: result 
    });
  } catch (error: any) {
    console.error("Feeling lucky error:", error);
    return NextResponse.json(
      { 
        error: "Failed to get random query", 
        details: error?.message || String(error) 
      },
      { status: 500 }
    );
  }
}
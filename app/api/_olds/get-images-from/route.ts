import getImagesFrom from "@/app/services/get-images-from";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit"));
    const targetFolder = String(searchParams.get("targetFolder")) || "";
  
    const nextPageToken =searchParams.get("nextPageToken") ? String(searchParams.get("nextPageToken")) : undefined;
    const parentFolder = searchParams.get("parentFolder") ? String(searchParams.get("parentFolder")) : undefined;

    const response = await getImagesFrom(targetFolder, parentFolder, limit, nextPageToken);
    
    const headers = new Headers({
      "Content-Type": "application/json",
      "Cache-Control": "s-maxage=60, stale-while-revalidate=600",
    });
    
    return NextResponse.json(response, {
      status: 200,
      headers
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
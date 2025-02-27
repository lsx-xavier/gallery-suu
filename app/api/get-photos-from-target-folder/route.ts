import getPhotosFromTargetFolder from "@/app/services/get-photos-from-target-folder";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    console.debug('[get-photos-from-target-folder - API] Start');
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get('limit') || '18';
    const nextPageToken = searchParams.get('nextPageToken');
    const targetFolder = searchParams.get('targetFolder');

    const response = await getPhotosFromTargetFolder(targetFolder, Number(limit), nextPageToken || undefined);

    console.debug('[get-photos-from-target-folder - API] Finished');
    return NextResponse.json(response);
  } catch (err) {
    console.error('[get-photos-from-target-folder - API] Error getting photos:', err);
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
}
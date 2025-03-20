export const maxDuration = 50; // This function can run for a maximum of 50 seconds

import getPhotosFromTargetFolder from '@/app/services/get-photos-from-target-folder';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    console.debug('[get-photos-from-target-folder - API] Start');
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get('limit') || '18';
    const nextPageToken = searchParams.get('nextPageToken');
    const foldersToSearch = searchParams.get('foldersToSearch');

    const response = await getPhotosFromTargetFolder(
      foldersToSearch,
      Number(limit),
      nextPageToken || undefined,
    );

    console.debug('[get-photos-from-target-folder - API] Finished');
    return NextResponse.json(response);
  } catch (err) {
    console.error('[get-photos-from-target-folder - API] Error getting photos:', err);
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
}

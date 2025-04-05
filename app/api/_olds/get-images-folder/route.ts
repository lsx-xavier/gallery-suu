import getImages from '@/app/services/_olds/get-images';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const pageToken = searchParams.get('pageToken') || '';
    const limit = Number(searchParams.get('limit')) || 10;
    const folderName = String(searchParams.get('folderName')) || '';

    const response = await getImages(folderName, pageToken, limit);

    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 's-maxage=60, stale-while-revalidate=600',
    });

    return NextResponse.json(response, {
      status: 200,
      headers,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

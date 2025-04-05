import { crawlerTheFolders } from '@/app/services/crawler';

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('[crawler-API] Start');

    crawlerTheFolders((message) => console.log(message))
      .then(() => {
        console.log('[API] Crawler completed successfully');
      })
      .catch((error) => {
        console.error('[API] Crawler error:', error);
      });

    return NextResponse.json('[crawler-API] Finished', {
      status: 200,
    });
  } catch (error) {
    console.log('[crawler-API] Get some error', error);
    return NextResponse.json({ error: '[crawler-API] Get some error' }, { status: 500 });
  }
}

import { redis } from '@/(infra)/config/redis';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const status = await redis.hgetall('crawler:status');
    const all = await redis.keys('folder:*');
    console.log({ all }, all.length);
    console.log(all.find((i) => i.includes('folder:keiti-e-diogo')));

    const especifcFolder = await redis.hgetall('folder:keiti-e-diogo:natal-2023');

    console.log({ especifcFolder });

    return NextResponse.json({ lastSaved: status, folders: all });
  } catch (err) {
    console.error('[crawler-SERVICE] Error getting status:', err);
    return NextResponse.json({ error: '[crawler-SERVICE] Error getting status:' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await redis.flushall();

    return NextResponse.json('All data flushed', { status: 200 });
  } catch (err) {
    console.error('[crawler-SERVICE] Error getting status:', err);
    return NextResponse.json({ error: '[crawler-SERVICE] Error getting status:' }, { status: 500 });
  }
}

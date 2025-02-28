import { redis } from "@/config/redis";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const status = await redis.hgetall('crawler:status');
    const all = await redis.keys('folder:*');
    console.log({ all }, all.length)
    console.log(all.find(i => i.includes('folder:keiti-e-diogo')))

    return NextResponse.json({ lastSaved: status, folders: all });
  } catch (err) {
    console.error('[crawler-SERVICE] Error getting status:', err);
    return null;
  }
}

export async function DELETE() {
  try {
    await redis.flushall();

    return NextResponse.json('All data flushed', { status: 200 });
  } catch (err) {
    console.error('[crawler-SERVICE] Error getting status:', err);
    return null;
  }
}
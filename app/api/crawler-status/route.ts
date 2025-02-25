import { redis } from "@/config/redis";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const status = await redis.hgetall('crawler:status');
    const all = await redis.keys('folder:*');
    console.log({ all }, all.length)

    return NextResponse.json({ status });
  } catch (err) {
    console.error('[crawler-SERVICE] Error getting status:', err);
    return null;
  }
}
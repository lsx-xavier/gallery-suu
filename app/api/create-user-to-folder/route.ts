import createUserToFolder from "@/app/services/create-user-to-folder";
import { redis } from "@/config/redis";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { folders, user, pass } = body;

    const response = await createUserToFolder(folders, user, pass);

    console.log('[create-user-to-folder] Response', response);

    return NextResponse.json(response, {
      status: 200,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const status = await redis.hgetall('auth:status');
    const all = await redis.keys('auth:*');

    const allFindedLessStatus = all.filter(a => !a.includes('status'))
    console.log({ allFindedLessStatus }, allFindedLessStatus.length)

    return NextResponse.json({ status });
  } catch (err) {
    console.error('[create-user-to-folder - API] Error getting status:', err);
    return null;
  }
}

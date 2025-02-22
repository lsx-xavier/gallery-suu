import { crawlerTheFolders } from "@/app/services/crawler";

import { NextResponse } from "next/server";

export async function GET() {
  try {
    crawlerTheFolders();

    console.log('[crawler-new] Start')
    return NextResponse.json('[crawler-new] Start', {
      status: 200,
    });
  } catch (error) {
    console.log('[crawler-new] Get some error', error)
    return NextResponse.json({ error: '[crawler-new] Get some error' }, { status: 500 });
  }
}
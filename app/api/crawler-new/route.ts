import { crawlerTheFolders } from "@/app/services/crawler";

import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await crawlerTheFolders();
    console.log('response', response)

    return NextResponse.json(response, {
      status: 200,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
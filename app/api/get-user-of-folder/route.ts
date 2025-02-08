import getUserOfFolder from "@/app/services/get-user-of-folder";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const folderName = String(searchParams.get("folderName")) || "";

    const response = await getUserOfFolder(folderName);

    const headers = new Headers({
      "Content-Type": "application/json",
      "Cache-Control": "s-maxage=60, stale-while-revalidate=600",
    });
    
    return NextResponse.json(response, {
      status: 200,
      headers
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
/* eslint-disable @typescript-eslint/no-explicit-any */
import auth from "@/app/services/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const data = await auth(req);

    const response = NextResponse.json(data, {
      status: 200,
    })

    response.headers.append(
      "Set-Cookie",
      `userToken=${data}; Path=/galeria; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`
    )

    return response;
  } catch (error: any) {
    return NextResponse.json({ message: error.body }, { status: error.code });
  }
}
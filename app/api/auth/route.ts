/* eslint-disable @typescript-eslint/no-explicit-any */
import auth from "@/app/services/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message, code } = await auth(req);

    const response = NextResponse.json(message, {
      status: code,
    })

    // 2 dias em segundos (seg * min * horas * dias)
    const time = 60 * 60 * 24 * 2

    response.headers.append(
      "Set-Cookie",
      `suuAuth=${message.authToken}; Path=/galeria/${message.folders.join('/')}; HttpOnly; Secure; SameSite=Strict; Max-Age=${time}`
    )

    return response;
  } catch (error: any) {
    return NextResponse.json({ message: error.body }, { status: error.code });
  }
}
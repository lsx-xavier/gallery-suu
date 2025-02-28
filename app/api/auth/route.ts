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

    const basePath = '/galeria';
    const folderPath = message.folders.length > 0
      ? `${basePath}/${message.folders.join('/')}`
      : basePath;

    // Log para debug
    console.log('Setting cookie path:', folderPath);

    response.headers.append(
      "Set-Cookie",
      `suuAuth=${message.authToken}; Path=${folderPath}; HttpOnly; Secure; SameSite=Strict; Max-Age=${time}`
    )

    // Adiciona um header para debug
    response.headers.append('X-Debug-Cookie-Path', folderPath);

    return response;
  } catch (error: any) {
    return NextResponse.json({ message: error.body }, { status: error.code });
  }
}
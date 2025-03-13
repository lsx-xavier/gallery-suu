/* eslint-disable @typescript-eslint/no-explicit-any */
import auth from "@/app/services/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message, code } = await auth(req);

    const response = NextResponse.json(message, {
      status: code,
    })

    
    
    const basePath = '/galeria';
    const folderPath = message.folders.length > 0
    ? `${basePath}/${message.folders.join('/')}`
    : basePath;
    
    const cookiePath = message.isAdmin ? basePath : folderPath;
    
    // segundos (seg * min * horas * dias) (admin 7 dias | user 2 dias)
    const time =  60 * 60 * 24 * (message.isAdmin ? 7 : 2)

    response.headers.append(
      "Set-Cookie",
      `suuAuth=${message.authToken}; Path=${cookiePath}; HttpOnly; Secure; SameSite=Strict; Max-Age=${time}`
    )

    // Adiciona um header para debug
    response.headers.append('X-Debug-Cookie-Path', cookiePath);

    return response;
  } catch (error: any) {
    return NextResponse.json({ message: error.body }, { status: error.code });
  }
}
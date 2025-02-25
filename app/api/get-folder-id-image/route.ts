import { getFolderIdImage } from "@/app/services/get-folder-id-image";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    console.log(req.url)
    console.log(searchParams)
    const currentFolder = String(searchParams.get("currentFolder")) || "";
    const folderIdWithImage = await getFolderIdImage(currentFolder);

    return NextResponse.json(folderIdWithImage, {
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Falha ao buscar os dados' }, { status: 500 });
  }
}
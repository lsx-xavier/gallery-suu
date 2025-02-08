import createUserToFolder from "@/app/services/create-user-to-folder";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body =await req.json()
    const { folderName, user, pass } = body;

    const response = await createUserToFolder(folderName, user, pass);

    return NextResponse.json(response, {
      status: 200,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
export const maxDuration = 50; // This function can run for a maximum of 50 seconds

import { downloadImages } from '@/app/services/download-image';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    console.debug('[download-photo - API] Start');
    const { searchParams } = new URL(req.url);
    const foldersName = JSON.parse(searchParams.get('foldersName') || '') as string[];
    const photoId = searchParams.get('photoId');

    const fileStream = await downloadImages({
      foldersName,
      photoId: photoId || undefined,
    });

    if (!fileStream) {
      return NextResponse.json({ error: 'Nenhum arquivo encontrado' }, { status: 404 });
    }

    console.debug('[download-photo - API] Finished');

    // Se for uma única imagem, retorna diretamente
    if (photoId) {
      return new NextResponse((fileStream as Buffer & { data: Buffer }).data, {
        headers: {
          'Content-Type': 'image/jpeg',
          'Content-Disposition': `attachment; filename="suuk.jpg"`,
        },
      });
    }

    return new NextResponse(fileStream as Buffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${foldersName.join(' - ')}.zip"`,
      },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[download-photo - API] Error getting photos:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

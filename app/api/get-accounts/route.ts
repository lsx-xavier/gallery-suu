import getAllAccounts from '@/app/services/get-accounts';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.debug('[get-all-accounts - API] Start');

    const allAccounts = await getAllAccounts();
    console.log(allAccounts);

    if (!allAccounts) {
      return NextResponse.json({ error: 'Nenhum usuário encontrado' }, { status: 404 });
    }

    return NextResponse.json(allAccounts, { status: 200 });
  } catch (err) {
    console.error('[get-all-accounts - API] Error getting accounts:', err);
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
}

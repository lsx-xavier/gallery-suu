import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.EDGE_BASE_URL || '';
const EDGE_CONFIG_KEY = process.env.EDGE_CONFIG_KEY || '';
const EDGE_TOKEN_KEY = process.env.EDGE_TOKEN_KEY || '';

// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);


//     const response = await fetch(`${BASE_URL}/${EDGE_CONFIG_KEY}`, {
//       headers: {
//         'Authorization': `Bearer ${EDGE_TOKEN_KEY}`,
//       },
//     });

//     if (!response.ok) {
//       throw new Error('Failed to fetch from Edge Config');
//     }

//     const data = await response.json();
//     return NextResponse.json(data);
//   } catch (error) {
//     console.error('Error fetching from edge config:', error);
//     return NextResponse.json({ error: 'Failed to fetch from Edge Config' }, { status: 500 });
//   }
// }

export async function POST(req: NextRequest) {
  console.log("Initializing edge store")
  try {
    const { key, value } = await req.json();
    console.log('key', key)
    console.log('value', value)

    const response = await fetch(`${BASE_URL}/${EDGE_CONFIG_KEY}/items`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${EDGE_TOKEN_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            operation: 'upsert',
            key,
            value
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error('Failed to update Edge Config');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating edge config:', error);
    return NextResponse.json({ error: 'Failed to update Edge Config' }, { status: 500 });
  }
}
import { NextResponse } from "next/server";

const BASE_URL = process.env.EDGE_BASE_URL;
const EDGE_CONFIG_KEY = process.env.EDGE_CONFIG_KEY;
const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN;

export async function DELETE() {
  try {
    const readAllEdgeConfigItems = await fetch(`${BASE_URL}/${EDGE_CONFIG_KEY}/items`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${VERCEL_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            operation: "delete",
            key: "drive_structure",
            value: ""
          }
        ]
      })
    });
    const result = await readAllEdgeConfigItems.json();
    console.log(result);
    return NextResponse.json(result);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Falha ao buscar os dados' }, { status: 500 });
  }
}
import { NextResponse } from "next/server";

const BASE_URL = process.env.EDGE_BASE_URL;
const EDGE_CONFIG_KEY = process.env.EDGE_CONFIG_KEY;
const EDGE_TOKEN_KEY = process.env.EDGE_TOKEN_KEY;

export async function GET() {
  try {
    const readAllEdgeConfigItems = await fetch(
      `${BASE_URL}/${EDGE_CONFIG_KEY}/items`,
      {
        headers: {
          Authorization: `Bearer ${EDGE_TOKEN_KEY}`,
        },
      }
    );
    const result = await readAllEdgeConfigItems.json();
    console.log(result);
    return NextResponse.json(result);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Falha ao buscar os dados' }, { status: 500 });
  }
}
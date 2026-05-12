import { NextResponse } from 'next/server'

// Pagamentos ainda não implementados
export async function POST() {
  return NextResponse.json({ error: 'Pagamentos em breve.' }, { status: 503 })
}

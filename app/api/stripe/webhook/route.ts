import { NextResponse } from 'next/server'

// Webhook Stripe ainda não implementado
export async function POST() {
  return NextResponse.json({ received: true })
}

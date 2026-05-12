import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 400 })
  }

  const supabase = createAdminClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { userId, courseId } = session.metadata!

    // Atualiza pagamento
    await supabase
      .from('payments')
      .update({ status: 'paid', stripe_payment_intent: session.payment_intent as string })
      .eq('stripe_session_id', session.id)

    // Cria matrícula
    const { data: payment } = await supabase
      .from('payments')
      .select('id')
      .eq('stripe_session_id', session.id)
      .single()

    await supabase.from('enrollments').upsert({
      user_id: userId,
      course_id: courseId,
      paid_at: new Date().toISOString(),
      payment_id: payment?.id,
    }, { onConflict: 'user_id,course_id' })
  }

  if (event.type === 'charge.refunded') {
    const charge = event.data.object as Stripe.Charge
    await supabase
      .from('payments')
      .update({ status: 'refunded' })
      .eq('stripe_payment_intent', charge.payment_intent as string)
  }

  return NextResponse.json({ received: true })
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { courseId } = await req.json()

  const { data: course } = await supabase
    .from('courses')
    .select('id, title, price_cents, slug')
    .eq('id', courseId)
    .eq('status', 'published')
    .single()

  if (!course) return NextResponse.json({ error: 'Curso não encontrado' }, { status: 404 })

  // Verifica se já está matriculado
  const { data: existing } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .single()

  if (existing) return NextResponse.json({ error: 'Você já tem acesso a este curso' }, { status: 400 })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: user.email,
    line_items: [{
      price_data: {
        currency: 'brl',
        product_data: { name: course.title },
        unit_amount: course.price_cents,
      },
      quantity: 1,
    }],
    metadata: { userId: user.id, courseId: course.id },
    success_url: `${appUrl}/obrigado?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/cursos/${course.slug}`,
  })

  // Registra pagamento pendente
  await supabase.from('payments').insert({
    user_id: user.id,
    course_id: course.id,
    stripe_session_id: session.id,
    amount_cents: course.price_cents,
    status: 'pending',
  })

  return NextResponse.json({ url: session.url })
}

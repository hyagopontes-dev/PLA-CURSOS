import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Compra confirmada!' }

type EnrollmentRow = {
  id: string
  courses: { title: string; slug: string } | null
}

export default async function ObrigadoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('enrollments')
    .select('id, courses(title, slug)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(1)

  const latest = ((data ?? []) as unknown as EnrollmentRow[])[0]

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="card p-10 max-w-lg w-full text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-3xl font-bold mb-3">Pagamento confirmado!</h1>
        {latest?.courses && (
          <p className="text-gray-500 mb-8">
            Você agora tem acesso completo ao curso{' '}
            <strong className="text-gray-800">{latest.courses.title}</strong>.
          </p>
        )}
        <div className="space-y-3">
          {latest?.courses && (
            <Link href={`/cursos/${latest.courses.slug}`} className="btn-primary block">
              Começar o curso agora →
            </Link>
          )}
          <Link href="/minha-area" className="btn-secondary block">
            Ir para minha área
          </Link>
        </div>
      </div>
    </div>
  )
}

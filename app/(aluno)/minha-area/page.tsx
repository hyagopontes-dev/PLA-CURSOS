import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Minha Área' }

type EnrollmentRow = {
  id: string
  courses: { id: string; title: string; thumbnail_url: string | null; slug: string; instructor_name: string } | null
}

type ProfileRow = { full_name: string | null }

export default async function MinhaAreaPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: enrollData } = await supabase
    .from('enrollments')
    .select('id, courses(id, title, thumbnail_url, slug, instructor_name)')
    .eq('user_id', user!.id)
    .not('paid_at', 'is', null)
    .order('created_at', { ascending: false })

  const { data: profileData } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user!.id)
    .single()

  const enrollments = (enrollData ?? []) as unknown as EnrollmentRow[]
  const profile = profileData as unknown as ProfileRow | null

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">
        Olá, {profile?.full_name?.split(' ')[0] ?? 'Aluno'} 👋
      </h1>
      <p className="text-gray-500 mb-8">Continue de onde parou.</p>

      {enrollments.length === 0 && (
        <div className="card p-10 text-center">
          <div className="text-5xl mb-4">📚</div>
          <h2 className="text-xl font-semibold mb-2">Nenhum curso ainda</h2>
          <p className="text-gray-500 mb-6">Explore nosso catálogo e comece a aprender hoje.</p>
          <Link href="/cursos" className="btn-primary inline-block">Ver cursos</Link>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {enrollments.map(e => (
          <div key={e.id} className="card overflow-hidden flex">
            {e.courses?.thumbnail_url && (
              <img src={e.courses.thumbnail_url} alt={e.courses.title} className="w-32 h-32 object-cover" />
            )}
            <div className="p-4 flex flex-col justify-between flex-1">
              <div>
                <p className="text-xs text-gray-400 mb-1">{e.courses?.instructor_name}</p>
                <h3 className="font-semibold text-gray-900">{e.courses?.title}</h3>
              </div>
              <Link href={`/cursos/${e.courses?.slug}`} className="text-brand-600 text-sm font-medium hover:underline mt-2">
                Continuar →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

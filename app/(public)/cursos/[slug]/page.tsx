import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatPrice, formatDuration } from '@/lib/utils'
import BuyButton from '@/components/course/BuyButton'
import type { Metadata } from 'next'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient()
  const { data } = await supabase.from('courses').select('title, description').eq('slug', params.slug).single()
  if (!data) return { title: 'Curso não encontrado' }
  return { title: data.title, description: data.description }
}

export default async function CourseLandingPage({ params }: Props) {
  const supabase = createClient()

  const { data: course } = await supabase
    .from('courses')
    .select(`*, modules(*, lessons(*))`)
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single()

  if (!course) notFound()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: enrollment } = user
    ? await supabase.from('enrollments').select('id').eq('user_id', user.id).eq('course_id', course.id).single()
    : { data: null }

  const totalLessons = course.modules?.reduce((acc: number, m: { lessons: unknown[] }) => acc + (m.lessons?.length ?? 0), 0) ?? 0
  const previewLessons = course.modules?.flatMap((m: { lessons: { is_preview: boolean }[] }) => m.lessons?.filter(l => l.is_preview) ?? []) ?? []

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid lg:grid-cols-3 gap-10">
        {/* Conteúdo principal */}
        <div className="lg:col-span-2">
          {course.thumbnail_url && (
            <img src={course.thumbnail_url} alt={course.title} className="w-full rounded-xl mb-8 aspect-video object-cover" />
          )}
          <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
          <p className="text-gray-600 text-lg mb-8">{course.description}</p>

          {/* Instrutor */}
          <div className="card p-6 mb-8">
            <h2 className="font-semibold text-lg mb-1">Instrutor</h2>
            <p className="font-medium">{course.instructor_name}</p>
            {course.instructor_bio && <p className="text-gray-500 mt-2">{course.instructor_bio}</p>}
          </div>

          {/* Ementa */}
          <h2 className="text-2xl font-bold mb-4">Conteúdo do curso</h2>
          <p className="text-gray-500 mb-4">{totalLessons} aulas • {course.modules?.length ?? 0} módulos</p>
          <div className="space-y-3">
            {course.modules?.map((mod: { id: string; title: string; lessons: { id: string; title: string; is_preview: boolean; duration_seconds: number | null }[] }) => (
              <div key={mod.id} className="card overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 font-medium border-b border-gray-200">
                  {mod.title}
                </div>
                <ul className="divide-y divide-gray-100">
                  {mod.lessons?.map(lesson => (
                    <li key={lesson.id} className="px-4 py-3 flex items-center justify-between text-sm">
                      <span className={lesson.is_preview ? 'text-brand-600' : 'text-gray-700'}>
                        {lesson.is_preview ? '🔓 ' : '🔒 '}{lesson.title}
                      </span>
                      {lesson.duration_seconds && (
                        <span className="text-gray-400">{formatDuration(lesson.duration_seconds)}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar de compra */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-6">
            <div className="text-4xl font-bold text-brand-600 mb-2">
              {formatPrice(course.price_cents)}
            </div>
            <p className="text-gray-500 text-sm mb-6">Acesso vitalício</p>

            {enrollment ? (
              <a href={`/aula/${previewLessons[0]?.id ?? ''}`} className="btn-primary w-full block text-center">
                Continuar assistindo →
              </a>
            ) : (
              <BuyButton courseId={course.id} courseTitle={course.title} priceCents={course.price_cents} isLoggedIn={!!user} />
            )}

            <ul className="mt-6 space-y-2 text-sm text-gray-600">
              <li>✅ Acesso vitalício</li>
              <li>✅ Vídeos, PDFs e quizzes</li>
              <li>✅ Certificado de conclusão</li>
              <li>✅ Suporte pelo e-mail</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

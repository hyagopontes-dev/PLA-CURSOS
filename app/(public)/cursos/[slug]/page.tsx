import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatPrice, formatDuration } from '@/lib/utils'
import BuyButton from '@/components/course/BuyButton'
import type { Metadata } from 'next'

type LessonItem = { id: string; title: string; is_preview: boolean; duration_seconds: number | null }
type ModuleItem = { id: string; title: string; lessons: LessonItem[] }
type CourseDetail = {
  id: string; title: string; description: string; thumbnail_url: string | null
  price_cents: number; instructor_name: string; instructor_bio: string | null
  modules: ModuleItem[]
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = createClient()
  const { data } = await supabase.from('courses').select('title, description').eq('slug', slug).single()
  const course = data as unknown as { title: string; description: string } | null
  if (!course) return { title: 'Curso não encontrado' }
  return { title: course.title, description: course.description }
}

export default async function CourseLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createClient()

  const { data } = await supabase
    .from('courses')
    .select('id, title, description, thumbnail_url, price_cents, instructor_name, instructor_bio, modules(id, title, lessons(id, title, is_preview, duration_seconds))')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  const course = data as unknown as CourseDetail | null
  if (!course) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: enrollment } = user
    ? await supabase.from('enrollments').select('id').eq('user_id', user.id).eq('course_id', course.id).single()
    : { data: null }

  const totalLessons = course.modules?.reduce((acc, m) => acc + (m.lessons?.length ?? 0), 0) ?? 0
  const firstLesson = course.modules?.[0]?.lessons?.find(l => l.is_preview)

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          {course.thumbnail_url && (
            <img src={course.thumbnail_url} alt={course.title} className="w-full rounded-xl mb-8 aspect-video object-cover" />
          )}
          <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
          <p className="text-gray-600 text-lg mb-8">{course.description}</p>
          <div className="card p-6 mb-8">
            <h2 className="font-semibold text-lg mb-1">Instrutor</h2>
            <p className="font-medium">{course.instructor_name}</p>
            {course.instructor_bio && <p className="text-gray-500 mt-2">{course.instructor_bio}</p>}
          </div>
          <h2 className="text-2xl font-bold mb-4">Conteúdo do curso</h2>
          <p className="text-gray-500 mb-4">{totalLessons} aulas • {course.modules?.length ?? 0} módulos</p>
          <div className="space-y-3">
            {course.modules?.map(mod => (
              <div key={mod.id} className="card overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 font-medium border-b border-gray-200">{mod.title}</div>
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
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-6">
            <div className="text-4xl font-bold text-brand-600 mb-2">{formatPrice(course.price_cents)}</div>
            <p className="text-gray-500 text-sm mb-6">Acesso vitalício</p>
            {enrollment ? (
              <a href={`/aula/${firstLesson?.id ?? ''}`} className="btn-primary w-full block text-center">
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

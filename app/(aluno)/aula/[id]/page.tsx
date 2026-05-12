import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import VideoPlayer from '@/components/player/VideoPlayer'
import PdfViewer from '@/components/player/PdfViewer'
import MarkdownContent from '@/components/player/MarkdownContent'
import LessonSidebar from '@/components/player/LessonSidebar'
import Link from 'next/link'

interface Props {
  params: { id: string }
}

export default async function AulaPage({ params }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: lesson } = await supabase
    .from('lessons')
    .select(`*, modules(*, courses(*))`)
    .eq('id', params.id)
    .single()

  if (!lesson) notFound()

  const course = lesson.modules?.courses
  const courseId = course?.id

  // Verifica acesso: preview ou matriculado
  if (!lesson.is_preview) {
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', user!.id)
      .eq('course_id', courseId)
      .not('paid_at', 'is', null)
      .single()

    if (!enrollment) redirect(`/cursos/${course?.slug}`)
  }

  // Busca todos os módulos e aulas do curso para a sidebar
  const { data: modules } = await supabase
    .from('modules')
    .select(`*, lessons(*)`)
    .eq('course_id', courseId)
    .order('order_index')

  // Progresso atual
  const { data: progress } = await supabase
    .from('lesson_progress')
    .select('*')
    .eq('user_id', user!.id)
    .in('lesson_id', modules?.flatMap(m => m.lessons.map((l: { id: string }) => l.id)) ?? [])

  const hasQuiz = lesson.content_type !== 'text'

  return (
    <div className="flex min-h-screen bg-gray-950">
      {/* Área de conteúdo */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <div className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between border-b border-gray-800">
          <Link href="/minha-area" className="text-gray-400 hover:text-white text-sm">← Minha área</Link>
          <h1 className="text-sm font-medium truncate mx-4">{course?.title}</h1>
          <span className="text-gray-400 text-sm">{lesson.title}</span>
        </div>

        {/* Player */}
        <div className="flex-1 p-6 max-w-4xl mx-auto w-full">
          <h2 className="text-white text-2xl font-bold mb-6">{lesson.title}</h2>

          {lesson.content_type === 'video' && lesson.video_url && (
            <VideoPlayer url={lesson.video_url} lessonId={lesson.id} />
          )}
          {lesson.content_type === 'pdf' && lesson.pdf_url && (
            <PdfViewer url={lesson.pdf_url} />
          )}
          {lesson.content_type === 'text' && lesson.content_md && (
            <MarkdownContent content={lesson.content_md} />
          )}

          {hasQuiz && (
            <div className="mt-8">
              <Link href={`/aula/${lesson.id}/quiz`} className="btn-primary inline-block">
                Fazer quiz desta aula →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar de navegação */}
      <LessonSidebar
        modules={modules ?? []}
        currentLessonId={lesson.id}
        progressMap={Object.fromEntries((progress ?? []).map(p => [p.lesson_id, p]))}
      />
    </div>
  )
}

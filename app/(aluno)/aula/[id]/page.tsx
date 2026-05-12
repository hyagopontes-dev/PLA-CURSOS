import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import VideoPlayer from '@/components/player/VideoPlayer'
import PdfViewer from '@/components/player/PdfViewer'
import MarkdownContent from '@/components/player/MarkdownContent'
import LessonSidebar from '@/components/player/LessonSidebar'
import Link from 'next/link'

type LessonRow = {
  id: string; title: string; content_type: string
  video_url: string | null; pdf_url: string | null; content_md: string | null
  is_preview: boolean
  modules: { courses: { id: string; title: string; slug: string } | null } | null
}
type ModuleRow = { id: string; title: string; order_index: number; lessons: LessonItemRow[] }
type LessonItemRow = { id: string; title: string; content_type: string; is_preview: boolean; order_index: number; duration_seconds: number | null }
type ProgressRow = { id: string; user_id: string; lesson_id: string; completed: boolean; watched_seconds: number; quiz_score: number | null; updated_at: string }

export default async function AulaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: lessonData } = await supabase
    .from('lessons')
    .select('id, title, content_type, video_url, pdf_url, content_md, is_preview, modules(courses(id, title, slug))')
    .eq('id', id)
    .single()

  const lesson = lessonData as unknown as LessonRow | null
  if (!lesson) notFound()

  const course = lesson.modules?.courses
  const courseId = course?.id

  if (!lesson.is_preview) {
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', user!.id)
      .eq('course_id', courseId!)
      .not('paid_at', 'is', null)
      .single()
    if (!enrollment) redirect(`/cursos/${course?.slug}`)
  }

  const { data: modulesData } = await supabase
    .from('modules')
    .select('id, title, order_index, lessons(id, title, content_type, is_preview, order_index, duration_seconds)')
    .eq('course_id', courseId!)
    .order('order_index')

  const modules = (modulesData ?? []) as unknown as ModuleRow[]

  const allLessonIds = modules.flatMap(m => m.lessons.map(l => l.id))
  const { data: progressData } = await supabase
    .from('lesson_progress')
    .select('id, user_id, lesson_id, completed, watched_seconds, quiz_score, updated_at')
    .eq('user_id', user!.id)
    .in('lesson_id', allLessonIds)

  const progress = (progressData ?? []) as unknown as ProgressRow[]
  const progressMap = Object.fromEntries(progress.map(p => [p.lesson_id, p]))

  return (
    <div className="flex min-h-screen bg-gray-950">
      <div className="flex-1 flex flex-col">
        <div className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between border-b border-gray-800">
          <Link href="/minha-area" className="text-gray-400 hover:text-white text-sm">← Minha área</Link>
          <h1 className="text-sm font-medium truncate mx-4">{course?.title}</h1>
          <span className="text-gray-400 text-sm">{lesson.title}</span>
        </div>
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
          <div className="mt-8">
            <Link href={`/aula/${lesson.id}/quiz`} className="btn-primary inline-block">
              Fazer quiz desta aula →
            </Link>
          </div>
        </div>
      </div>
      <LessonSidebar modules={modules} currentLessonId={lesson.id} progressMap={progressMap} />
    </div>
  )
}

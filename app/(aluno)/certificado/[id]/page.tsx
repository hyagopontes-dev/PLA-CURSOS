import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CertificateView from '@/components/course/CertificateView'

type EnrollmentRow = {
  id: string; course_id: string; paid_at: string | null; created_at: string
  profiles: { full_name: string | null } | null
  courses: { title: string } | null
}

export default async function CertificadoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: enrollData } = await supabase
    .from('enrollments')
    .select('id, course_id, paid_at, created_at, profiles(full_name), courses(title)')
    .eq('id', id)
    .eq('user_id', user!.id)
    .single()

  const enrollment = enrollData as unknown as EnrollmentRow | null
  if (!enrollment) notFound()

  const { data: lessonsData } = await supabase
    .from('lessons')
    .select('id')
    .eq('modules.course_id', enrollment.course_id)

  const { data: progressData } = await supabase
    .from('lesson_progress')
    .select('lesson_id')
    .eq('user_id', user!.id)
    .eq('completed', true)

  const lessonIds = new Set((lessonsData ?? []).map((l: { id: string }) => l.id))
  const completedIds = new Set((progressData ?? []).map((p: { lesson_id: string }) => p.lesson_id))
  const allCompleted = lessonIds.size > 0 && [...lessonIds].every(lid => completedIds.has(lid))

  if (!allCompleted) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center">
        <div className="text-5xl mb-4">⏳</div>
        <h1 className="text-2xl font-bold mb-2">Certificado não disponível</h1>
        <p className="text-gray-500">Conclua todas as aulas do curso para obter o certificado.</p>
      </div>
    )
  }

  return (
    <CertificateView
      studentName={enrollment.profiles?.full_name ?? 'Aluno'}
      courseName={enrollment.courses?.title ?? ''}
      completedAt={enrollment.paid_at ?? enrollment.created_at}
      enrollmentId={enrollment.id}
    />
  )
}

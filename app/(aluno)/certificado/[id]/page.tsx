import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CertificateView from '@/components/course/CertificateView'

interface Props { params: { id: string } }

export default async function CertificadoPage({ params }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: enrollment } = await supabase
    .from('enrollments')
    .select(`*, courses(*), profiles(*)`)
    .eq('id', params.id)
    .eq('user_id', user!.id)
    .single()

  if (!enrollment) notFound()

  // Verifica se completou todas as aulas
  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, modules!inner(course_id)')
    .eq('modules.course_id', enrollment.course_id)

  const { data: progress } = await supabase
    .from('lesson_progress')
    .select('lesson_id, completed')
    .eq('user_id', user!.id)
    .eq('completed', true)

  const completedIds = new Set(progress?.map(p => p.lesson_id))
  const allCompleted = lessons?.every(l => completedIds.has(l.id))

  if (!allCompleted) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center">
        <div className="text-5xl mb-4">⏳</div>
        <h1 className="text-2xl font-bold mb-2">Certificado não disponível</h1>
        <p className="text-gray-500">Você precisa concluir todas as aulas do curso para obter o certificado.</p>
      </div>
    )
  }

  return (
    <CertificateView
      studentName={(enrollment.profiles as unknown as { full_name: string })?.full_name ?? 'Aluno'}
      courseName={(enrollment.courses as unknown as { title: string })?.title ?? ''}
      completedAt={enrollment.paid_at ?? enrollment.created_at}
      enrollmentId={enrollment.id}
    />
  )
}

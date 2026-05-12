import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CourseEditor from '@/components/admin/CourseEditor'
import type { Metadata } from 'next'

interface Props { params: { id: string } }

export const metadata: Metadata = { title: 'Editar curso — Admin' }

export default async function EditarCursoPage({ params }: Props) {
  const supabase = createClient()
  const { data: course } = await supabase
    .from('courses')
    .select(`*, modules(*, lessons(*))`)
    .eq('id', params.id)
    .single()

  if (!course) notFound()

  return <CourseEditor course={course} />
}

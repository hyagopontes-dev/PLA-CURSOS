import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CourseEditor from '@/components/admin/CourseEditor'
import { CourseWithModules } from '@/types/database'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Editar curso — Admin' }

export default async function EditarCursoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('courses')
    .select('*, modules(*, lessons(*))')
    .eq('id', id)
    .single()

  const course = data as unknown as CourseWithModules | null
  if (!course) notFound()

  return <CourseEditor course={course} />
}

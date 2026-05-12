import { createClient } from '@/lib/supabase/server'
import CourseCard from '@/components/course/CourseCard'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Catálogo de Cursos' }

export default async function CursosPage() {
  const supabase = createClient()
  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-2">Todos os cursos</h1>
        <p className="text-gray-500">{courses?.length ?? 0} cursos disponíveis</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(courses ?? []).map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
        {!courses?.length && (
          <p className="col-span-3 text-center text-gray-400 py-20">
            Nenhum curso disponível no momento.
          </p>
        )}
      </div>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import CourseCard from '@/components/course/CourseCard'
import { Course } from '@/types/database'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = createClient()
  const { data } = await supabase
    .from('courses')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(6)

  const courses = (data ?? []) as unknown as Course[]

  return (
    <>
      <section className="bg-gradient-to-br from-brand-900 to-brand-600 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Aprenda com quem <span className="text-brand-100">realmente</span> sabe
          </h1>
          <p className="text-xl text-brand-100 mb-10 max-w-2xl mx-auto">
            Cursos práticos e objetivos para acelerar sua carreira. Vídeos, PDFs, quizzes e certificado de conclusão.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/cursos" className="bg-white text-brand-700 px-8 py-4 rounded-xl font-semibold hover:bg-brand-50 transition-colors text-lg">
              Ver todos os cursos
            </Link>
            <Link href="/cadastro" className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-colors text-lg">
              Criar conta grátis
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-3 gap-8 text-center">
          {[
            { label: 'Cursos disponíveis', value: '20+' },
            { label: 'Alunos formados', value: '1.200+' },
            { label: 'Horas de conteúdo', value: '150h' },
          ].map(stat => (
            <div key={stat.label}>
              <div className="text-3xl font-bold text-brand-600">{stat.value}</div>
              <div className="text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold">Cursos em destaque</h2>
            <Link href="/cursos" className="text-brand-600 font-medium hover:underline">Ver todos →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-brand-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Pronto para começar?</h2>
          <p className="text-gray-600 mb-8">Compre um curso e tenha acesso imediato ao conteúdo completo.</p>
          <Link href="/cursos" className="btn-primary inline-block text-lg px-10 py-4">
            Explorar cursos
          </Link>
        </div>
      </section>
    </>
  )
}

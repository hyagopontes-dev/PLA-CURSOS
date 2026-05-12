import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import QuizClient from '@/components/quiz/QuizClient'
import { Quiz } from '@/types/database'

type LessonRow = { id: string; title: string; quizzes: Quiz[] }

export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createClient()

  const { data } = await supabase
    .from('lessons')
    .select('id, title, quizzes(id, lesson_id, question, options, correct_index, explanation, order_index)')
    .eq('id', id)
    .single()

  const lesson = data as unknown as LessonRow | null
  if (!lesson || !lesson.quizzes?.length) notFound()

  const sorted = [...lesson.quizzes].sort((a, b) => a.order_index - b.order_index)

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-2">Quiz: {lesson.title}</h1>
      <p className="text-gray-500 mb-8">{sorted.length} perguntas</p>
      <QuizClient quizzes={sorted} lessonId={lesson.id} />
    </div>
  )
}

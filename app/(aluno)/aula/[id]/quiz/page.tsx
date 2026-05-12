import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import QuizClient from '@/components/quiz/QuizClient'

interface Props { params: { id: string } }

export default async function QuizPage({ params }: Props) {
  const supabase = createClient()

  const { data: lesson } = await supabase
    .from('lessons')
    .select(`*, quizzes(*), modules(courses(*))`)
    .eq('id', params.id)
    .single()

  if (!lesson || !lesson.quizzes?.length) notFound()

  const sortedQuizzes = lesson.quizzes.sort((a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index)

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-2">Quiz: {lesson.title}</h1>
      <p className="text-gray-500 mb-8">{sortedQuizzes.length} perguntas</p>
      <QuizClient quizzes={sortedQuizzes} lessonId={lesson.id} />
    </div>
  )
}

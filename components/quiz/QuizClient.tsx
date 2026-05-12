'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Quiz } from '@/types/database'

interface Props {
  quizzes: Quiz[]
  lessonId: string
}

type Phase = 'quiz' | 'result'

export default function QuizClient({ quizzes, lessonId }: Props) {
  const supabase = createClient()
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answers, setAnswers] = useState<(number | null)[]>(Array(quizzes.length).fill(null))
  const [phase, setPhase] = useState<Phase>('quiz')
  const [saving, setSaving] = useState(false)

  const q = quizzes[current]
  const answered = selected !== null
  const isCorrect = selected === q.correct_index

  function handleSelect(idx: number) {
    if (answered) return
    setSelected(idx)
    const updated = [...answers]
    updated[current] = idx
    setAnswers(updated)
  }

  async function handleNext() {
    if (current < quizzes.length - 1) {
      setCurrent(c => c + 1)
      setSelected(answers[current + 1])
    } else {
      await finish()
    }
  }

  async function finish() {
    setSaving(true)
    const correct = answers.filter((a, i) => a === quizzes[i].correct_index).length
    const score = Math.round((correct / quizzes.length) * 100)

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await (supabase.from('lesson_progress') as any).upsert(
        { user_id: user.id, lesson_id: lessonId, completed: true, quiz_score: score },
        { onConflict: 'user_id,lesson_id' }
      )
    }
    setSaving(false)
    setPhase('result')
  }

  if (phase === 'result') {
    const correct = answers.filter((a, i) => a === quizzes[i].correct_index).length
    const score = Math.round((correct / quizzes.length) * 100)
    return (
      <div className="card p-8 text-center">
        <div className="text-6xl mb-4">{score >= 70 ? '🎉' : '📖'}</div>
        <h2 className="text-2xl font-bold mb-2">
          {score >= 70 ? 'Parabéns!' : 'Continue estudando!'}
        </h2>
        <p className="text-gray-500 mb-6">
          Você acertou <strong>{correct} de {quizzes.length}</strong> — pontuação: <strong>{score}%</strong>
        </p>
        <div className="space-y-3">
          <Link href={`/aula/${lessonId}`} className="btn-primary block">← Voltar para a aula</Link>
          {score < 70 && (
            <button onClick={() => {
              setAnswers(Array(quizzes.length).fill(null))
              setCurrent(0)
              setSelected(null)
              setPhase('quiz')
            }} className="btn-secondary w-full">
              Tentar novamente
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progresso */}
      <div className="flex items-center gap-2">
        {quizzes.map((_, i) => (
          <div key={i} className={cn(
            'h-1.5 flex-1 rounded-full transition-colors',
            i < current ? 'bg-brand-500' : i === current ? 'bg-brand-300' : 'bg-gray-200'
          )} />
        ))}
      </div>
      <p className="text-sm text-gray-400">Pergunta {current + 1} de {quizzes.length}</p>

      {/* Pergunta */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-6">{q.question}</h2>
        <div className="space-y-3">
          {q.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={answered}
              className={cn(
                'w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors',
                !answered && 'hover:border-brand-400 hover:bg-brand-50',
                answered && idx === q.correct_index && 'border-green-500 bg-green-50 text-green-800',
                answered && idx === selected && idx !== q.correct_index && 'border-red-400 bg-red-50 text-red-700',
                answered && idx !== selected && idx !== q.correct_index && 'border-gray-200 text-gray-400',
                !answered && 'border-gray-200'
              )}
            >
              <span className="font-medium mr-2">{String.fromCharCode(65 + idx)}.</span> {opt}
            </button>
          ))}
        </div>

        {answered && q.explanation && (
          <div className={cn(
            'mt-4 p-4 rounded-lg text-sm',
            isCorrect ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-800'
          )}>
            <strong>{isCorrect ? '✅ Correto!' : '❌ Errado.'}</strong> {q.explanation}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={() => { setCurrent(c => c - 1); setSelected(answers[current - 1]) }}
          disabled={current === 0}
          className="btn-secondary disabled:opacity-30"
        >
          ← Anterior
        </button>
        {answered && (
          <button onClick={handleNext} disabled={saving} className="btn-primary">
            {saving ? 'Salvando...' : current === quizzes.length - 1 ? 'Ver resultado →' : 'Próxima →'}
          </button>
        )}
      </div>
    </div>
  )
}

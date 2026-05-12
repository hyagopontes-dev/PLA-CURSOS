'use client'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { LessonProgress } from '@/types/database'

interface Lesson {
  id: string
  title: string
  content_type: string
  is_preview: boolean
  duration_seconds: number | null
  order_index: number
}
interface Module {
  id: string
  title: string
  lessons: Lesson[]
}

interface Props {
  modules: Module[]
  currentLessonId: string
  progressMap: Record<string, LessonProgress>
}

const typeIcon: Record<string, string> = { video: '▶', pdf: '📄', text: '📝' }

export default function LessonSidebar({ modules, currentLessonId, progressMap }: Props) {
  return (
    <aside className="w-80 bg-gray-900 border-l border-gray-800 overflow-y-auto flex-shrink-0">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-white font-semibold text-sm">Conteúdo do curso</h2>
      </div>
      {modules.map(mod => (
        <div key={mod.id}>
          <div className="px-4 py-2 bg-gray-800 text-gray-400 text-xs font-semibold uppercase tracking-wider">
            {mod.title}
          </div>
          <ul>
            {mod.lessons
              .sort((a, b) => a.order_index - b.order_index)
              .map(lesson => {
                const done = progressMap[lesson.id]?.completed
                const isCurrent = lesson.id === currentLessonId
                return (
                  <li key={lesson.id}>
                    <Link
                      href={`/aula/${lesson.id}`}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 text-sm border-l-2 transition-colors',
                        isCurrent
                          ? 'border-brand-500 bg-brand-900/20 text-white'
                          : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800'
                      )}
                    >
                      <span className="text-xs w-4 text-center flex-shrink-0">
                        {done ? '✅' : typeIcon[lesson.content_type] ?? '•'}
                      </span>
                      <span className="flex-1 line-clamp-2 leading-snug">{lesson.title}</span>
                    </Link>
                  </li>
                )
              })}
          </ul>
        </div>
      ))}
    </aside>
  )
}

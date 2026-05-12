'use client'
import { extractVideoId } from '@/lib/utils'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props { url: string; lessonId: string }

export default function VideoPlayer({ url, lessonId }: Props) {
  const { platform, id } = extractVideoId(url)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(supabase.from('lesson_progress') as any).upsert(
        { user_id: user.id, lesson_id: lessonId, completed: false },
        { onConflict: 'user_id,lesson_id', ignoreDuplicates: true }
      )
    })
  }, [lessonId])

  async function markComplete() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('lesson_progress') as any).upsert(
      { user_id: user.id, lesson_id: lessonId, completed: true },
      { onConflict: 'user_id,lesson_id' }
    )
  }

  if (!platform || !id) {
    return <div className="bg-gray-800 rounded-xl p-8 text-gray-400 text-center">URL de vídeo inválida.</div>
  }

  const src = platform === 'youtube'
    ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`
    : `https://player.vimeo.com/video/${id}`

  return (
    <div className="space-y-4">
      <div className="aspect-video rounded-xl overflow-hidden bg-black">
        <iframe
          src={src}
          className="w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
      <button onClick={markComplete} className="btn-secondary text-sm">
        ✅ Marcar aula como concluída
      </button>
    </div>
  )
}

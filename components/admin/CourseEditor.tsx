'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CourseWithModules } from '@/types/database'
import { slugify, formatPrice } from '@/lib/utils'

interface Props { course: CourseWithModules }

export default function CourseEditor({ course }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: course.title,
    description: course.description,
    instructor_name: course.instructor_name,
    instructor_bio: course.instructor_bio ?? '',
    price_cents: course.price_cents,
    status: course.status,
    thumbnail_url: course.thumbnail_url ?? '',
  })
  const [newModuleTitle, setNewModuleTitle] = useState('')
  const [expandedModule, setExpandedModule] = useState<string | null>(null)
  const [newLesson, setNewLesson] = useState<Record<string, {
    title: string; content_type: string; video_url: string
    pdf_url: string; content_md: string; is_preview: boolean
  }>>({})

  function set(field: string, value: unknown) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function saveCourse() {
    setSaving(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('courses') as any).update({ ...form, slug: slugify(form.title) }).eq('id', course.id)
    setSaving(false)
    router.refresh()
  }

  async function addModule() {
    if (!newModuleTitle.trim()) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('modules') as any).insert({
      course_id: course.id,
      title: newModuleTitle.trim(),
      order_index: (course.modules?.length ?? 0),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any).select().single()
    if (data) { setNewModuleTitle(''); router.refresh() }
  }

  async function deleteModule(moduleId: string) {
    if (!confirm('Excluir módulo e todas as suas aulas?')) return
    await supabase.from('modules').delete().eq('id', moduleId)
    router.refresh()
  }

  async function addLesson(moduleId: string) {
    const l = newLesson[moduleId]
    if (!l?.title?.trim()) return
    const moduleData = course.modules?.find(m => m.id === moduleId)
    await (supabase.from('lessons') as any).insert({
      module_id: moduleId,
      title: l.title,
      content_type: (l.content_type || 'video') as 'video' | 'pdf' | 'text',
      video_url: l.video_url || null,
      pdf_url: l.pdf_url || null,
      content_md: l.content_md || null,
      is_preview: l.is_preview ?? false,
      order_index: moduleData?.lessons?.length ?? 0,
    })
    setNewLesson(prev => ({
      ...prev,
      [moduleId]: { title: '', content_type: 'video', video_url: '', pdf_url: '', content_md: '', is_preview: false }
    }))
    router.refresh()
  }

  async function deleteLesson(lessonId: string) {
    if (!confirm('Excluir esta aula?')) return
    await supabase.from('lessons').delete().eq('id', lessonId)
    router.refresh()
  }

  async function togglePublish() {
    const newStatus = form.status === 'published' ? 'draft' : 'published'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('courses') as any).update({ status: newStatus }).eq('id', course.id)
    set('status', newStatus)
    router.refresh()
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Editar curso</h1>
        <div className="flex gap-3 items-center">
          <span className={`px-2 py-1 rounded text-xs font-medium ${form.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {form.status === 'published' ? 'Publicado' : 'Rascunho'}
          </span>
          <button onClick={togglePublish} className="btn-secondary text-sm py-2">
            {form.status === 'published' ? 'Despublicar' : 'Publicar'}
          </button>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-lg border-b border-gray-100 pb-3">Informações do curso</h2>
        <div>
          <label className="label">Título</label>
          <input className="input" value={form.title} onChange={e => set('title', e.target.value)} />
        </div>
        <div>
          <label className="label">Descrição</label>
          <textarea className="input min-h-[90px]" value={form.description} onChange={e => set('description', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Instrutor</label>
            <input className="input" value={form.instructor_name} onChange={e => set('instructor_name', e.target.value)} />
          </div>
          <div>
            <label className="label">Preço (centavos)</label>
            <input type="number" className="input" value={form.price_cents} onChange={e => set('price_cents', Number(e.target.value))} />
            <p className="text-xs text-gray-400 mt-1">{formatPrice(form.price_cents)}</p>
          </div>
        </div>
        <div>
          <label className="label">Bio do instrutor</label>
          <textarea className="input" value={form.instructor_bio} onChange={e => set('instructor_bio', e.target.value)} />
        </div>
        <div>
          <label className="label">URL da thumbnail</label>
          <input type="url" className="input" value={form.thumbnail_url} onChange={e => set('thumbnail_url', e.target.value)} />
        </div>
        <button onClick={saveCourse} disabled={saving} className="btn-primary">
          {saving ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-lg border-b border-gray-100 pb-3 mb-4">Módulos e Aulas</h2>

        {course.modules?.sort((a, b) => a.order_index - b.order_index).map(mod => (
          <div key={mod.id} className="border border-gray-200 rounded-xl mb-4 overflow-hidden">
            <div
              className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer"
              onClick={() => setExpandedModule(expandedModule === mod.id ? null : mod.id)}
            >
              <span className="font-medium">{mod.title}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">{mod.lessons?.length ?? 0} aulas</span>
                <button onClick={e => { e.stopPropagation(); deleteModule(mod.id) }} className="text-red-400 hover:text-red-600 text-sm">Excluir</button>
                <span className="text-gray-400">{expandedModule === mod.id ? '▲' : '▼'}</span>
              </div>
            </div>

            {expandedModule === mod.id && (
              <div className="p-4 space-y-3">
                {mod.lessons?.sort((a, b) => a.order_index - b.order_index).map(lesson => (
                  <div key={lesson.id} className="flex items-center justify-between py-2 border-b border-gray-100 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">
                        {{ video: '▶', pdf: '📄', text: '📝' }[lesson.content_type] ?? '•'}
                      </span>
                      <span>{lesson.title}</span>
                      {lesson.is_preview && (
                        <span className="text-xs bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded">Preview</span>
                      )}
                    </div>
                    <button onClick={() => deleteLesson(lesson.id)} className="text-red-400 hover:text-red-600 text-xs">Excluir</button>
                  </div>
                ))}

                <div className="bg-gray-50 rounded-lg p-4 space-y-3 mt-2">
                  <p className="text-sm font-medium text-gray-600">+ Nova aula</p>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      placeholder="Título da aula"
                      className="input col-span-2"
                      value={newLesson[mod.id]?.title ?? ''}
                      onChange={e => setNewLesson(prev => ({ ...prev, [mod.id]: { ...prev[mod.id], title: e.target.value } }))}
                    />
                    <select
                      className="input"
                      value={newLesson[mod.id]?.content_type ?? 'video'}
                      onChange={e => setNewLesson(prev => ({ ...prev, [mod.id]: { ...prev[mod.id], content_type: e.target.value } }))}
                    >
                      <option value="video">Vídeo</option>
                      <option value="pdf">PDF</option>
                      <option value="text">Texto/Markdown</option>
                    </select>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={newLesson[mod.id]?.is_preview ?? false}
                        onChange={e => setNewLesson(prev => ({ ...prev, [mod.id]: { ...prev[mod.id], is_preview: e.target.checked } }))}
                      />
                      Aula preview (grátis)
                    </label>
                  </div>
                  {(newLesson[mod.id]?.content_type ?? 'video') === 'video' && (
                    <input placeholder="URL do YouTube ou Vimeo" className="input"
                      value={newLesson[mod.id]?.video_url ?? ''}
                      onChange={e => setNewLesson(prev => ({ ...prev, [mod.id]: { ...prev[mod.id], video_url: e.target.value } }))}
                    />
                  )}
                  {(newLesson[mod.id]?.content_type ?? 'video') === 'pdf' && (
                    <input placeholder="URL do PDF no Supabase Storage" className="input"
                      value={newLesson[mod.id]?.pdf_url ?? ''}
                      onChange={e => setNewLesson(prev => ({ ...prev, [mod.id]: { ...prev[mod.id], pdf_url: e.target.value } }))}
                    />
                  )}
                  {(newLesson[mod.id]?.content_type ?? 'video') === 'text' && (
                    <textarea placeholder="Conteúdo em Markdown..." className="input min-h-[100px]"
                      value={newLesson[mod.id]?.content_md ?? ''}
                      onChange={e => setNewLesson(prev => ({ ...prev, [mod.id]: { ...prev[mod.id], content_md: e.target.value } }))}
                    />
                  )}
                  <button onClick={() => addLesson(mod.id)} className="btn-primary text-sm py-2">Adicionar aula</button>
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="flex gap-3 mt-4">
          <input
            placeholder="Título do novo módulo"
            className="input flex-1"
            value={newModuleTitle}
            onChange={e => setNewModuleTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addModule()}
          />
          <button onClick={addModule} className="btn-primary whitespace-nowrap">+ Módulo</button>
        </div>
      </div>
    </div>
  )
}

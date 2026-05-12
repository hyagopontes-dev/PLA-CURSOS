'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { slugify } from '@/lib/utils'

export default function NovoCursoPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    description: '',
    instructor_name: '',
    instructor_bio: '',
    price_cents: 0,
    status: 'draft' as 'draft' | 'published',
    thumbnail_url: '',
  })

  function set(field: string, value: unknown) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const payload = {
      title: form.title,
      description: form.description,
      instructor_name: form.instructor_name,
      instructor_bio: form.instructor_bio || null,
      price_cents: form.price_cents,
      status: form.status,
      thumbnail_url: form.thumbnail_url || null,
      slug: slugify(form.title),
    }

    const { data, error } = await supabase
      .from('courses')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(payload as any)
      .select()
      .single()

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push(`/admin/cursos/${data.id}`)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Novo curso</h1>
      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

        <div>
          <label className="label">Título *</label>
          <input className="input" required value={form.title} onChange={e => set('title', e.target.value)} />
          {form.title && <p className="text-xs text-gray-400 mt-1">Slug: {slugify(form.title)}</p>}
        </div>
        <div>
          <label className="label">Descrição *</label>
          <textarea className="input min-h-[100px]" required value={form.description} onChange={e => set('description', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Instrutor *</label>
            <input className="input" required value={form.instructor_name} onChange={e => set('instructor_name', e.target.value)} />
          </div>
          <div>
            <label className="label">Preço (centavos) *</label>
            <input type="number" className="input" min={0} value={form.price_cents} onChange={e => set('price_cents', Number(e.target.value))} />
            <p className="text-xs text-gray-400 mt-1">Ex: 9700 = R$ 97,00</p>
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
        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="draft">Rascunho</option>
            <option value="published">Publicado</option>
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Salvando...' : 'Criar curso'}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">Cancelar</button>
        </div>
      </form>
    </div>
  )
}

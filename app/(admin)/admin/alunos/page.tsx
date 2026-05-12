'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export default function NovoCursoPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    image_url: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // O "as any" aqui resolve o erro: "Property 'slug' does not exist in type 'never[]'"
    const { data, error: insertError } = await supabase
      .from('courses')
      .insert({
        ...form,
        price: Number(form.price),
        slug: slugify(form.title),
      } as any) 
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/admin/cursos')
    router.refresh()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Novo Curso</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-md mb-4">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Título do Curso</label>
          <input
            type="text"
            required
            className="w-full p-2 border rounded-md"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descrição</label>
          <textarea
            required
            className="w-full p-2 border rounded-md h-32"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Preço (R$)</label>
            <input
              type="number"
              required
              step="0.01"
              className="w-full p-2 border rounded-md"
              value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">URL da Imagem</label>
            <input
              type="text"
              className="w-full p-2 border rounded-md"
              value={form.image_url}
              onChange={e => setForm({ ...form, image_url: e.target.value })}
            />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Criar Curso'}
          </Button>
        </div>
      </form>
    </div>
  )
}
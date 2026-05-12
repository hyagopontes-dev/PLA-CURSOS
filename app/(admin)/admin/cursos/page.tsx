import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Cursos — Admin' }

type CourseRow = {
  id: string
  title: string
  status: string
  price_cents: number
}

export default async function AdminCursosPage() {
  const supabase = createClient()
  const { data } = await supabase
    .from('courses')
    .select('id, title, status, price_cents')
    .order('created_at', { ascending: false })

  const courses = (data ?? []) as unknown as CourseRow[]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Cursos</h1>
        <Link href="/admin/cursos/novo" className="btn-primary">+ Novo curso</Link>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Título', 'Status', 'Preço', 'Ações'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {courses.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{c.title}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {c.status === 'published' ? 'Publicado' : 'Rascunho'}
                  </span>
                </td>
                <td className="px-4 py-3">{formatPrice(c.price_cents)}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/cursos/${c.id}`} className="text-brand-600 hover:underline">Editar</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {courses.length === 0 && (
          <p className="text-center py-10 text-gray-400">Nenhum curso cadastrado.</p>
        )}
      </div>
    </div>
  )
}

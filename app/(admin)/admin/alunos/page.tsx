import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Alunos — Admin' }

type EnrollmentRow = {
  id: string
  paid_at: string | null
  profiles: { full_name: string | null; email: string } | null
  courses: { title: string } | null
}

export default async function AdminAlunosPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('enrollments')
    .select(`id, paid_at, profiles(full_name, email), courses(title)`)
    .not('paid_at', 'is', null)
    .order('created_at', { ascending: false })

  const enrollments = (data ?? []) as unknown as EnrollmentRow[]

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Alunos</h1>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Aluno', 'E-mail', 'Curso', 'Data'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {enrollments.map(e => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{e.profiles?.full_name ?? '—'}</td>
                <td className="px-4 py-3 text-gray-500">{e.profiles?.email ?? '—'}</td>
                <td className="px-4 py-3">{e.courses?.title ?? '—'}</td>
                <td className="px-4 py-3 text-gray-400">
                  {e.paid_at ? format(new Date(e.paid_at), 'dd/MM/yyyy', { locale: ptBR }) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {enrollments.length === 0 && (
          <p className="text-center py-10 text-gray-400">Nenhum aluno matriculado ainda.</p>
        )}
      </div>
    </div>
  )
}

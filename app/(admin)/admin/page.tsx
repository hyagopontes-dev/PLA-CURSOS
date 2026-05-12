import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin' }

export default async function AdminPage() {
  const supabase = createClient()

  const [
    { count: totalStudents },
    { count: totalCourses },
    { data: payments },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('courses').select('*', { count: 'exact', head: true }),
    supabase.from('payments').select('amount_cents').eq('status', 'paid'),
  ])

  const totalRevenue = payments?.reduce((acc, p) => acc + p.amount_cents, 0) ?? 0

  const stats = [
    { label: 'Alunos', value: totalStudents ?? 0 },
    { label: 'Cursos', value: totalCourses ?? 0 },
    { label: 'Receita total', value: formatPrice(totalRevenue) },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Painel Admin</h1>
      <div className="grid grid-cols-3 gap-6 mb-10">
        {stats.map(s => (
          <div key={s.label} className="card p-6">
            <p className="text-sm text-gray-500 mb-1">{s.label}</p>
            <p className="text-3xl font-bold text-brand-600">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Relatórios — Admin' }

type PaymentRow = {
  id: string
  course_id: string
  amount_cents: number
  created_at: string
  profiles: { full_name: string | null; email: string } | null
  courses: { title: string } | null
}

export default async function RelatoriosPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('payments')
    .select(`id, course_id, amount_cents, created_at, profiles(full_name, email), courses(title)`)
    .eq('status', 'paid')
    .order('created_at', { ascending: false })

  const payments = (data ?? []) as unknown as PaymentRow[]

  const totalRevenue = payments.reduce((acc, p) => acc + p.amount_cents, 0)

  const byCourse: Record<string, { title: string; count: number; revenue: number }> = {}
  payments.forEach(p => {
    if (!byCourse[p.course_id]) {
      byCourse[p.course_id] = { title: p.courses?.title ?? '—', count: 0, revenue: 0 }
    }
    byCourse[p.course_id].count += 1
    byCourse[p.course_id].revenue += p.amount_cents
  })

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Relatórios</h1>

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-5">
          <p className="text-sm text-gray-500 mb-1">Receita total</p>
          <p className="text-2xl font-bold text-brand-600">{formatPrice(totalRevenue)}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500 mb-1">Vendas realizadas</p>
          <p className="text-2xl font-bold">{payments.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500 mb-1">Ticket médio</p>
          <p className="text-2xl font-bold">
            {formatPrice(payments.length ? Math.round(totalRevenue / payments.length) : 0)}
          </p>
        </div>
      </div>

      {/* Por curso */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 font-semibold">Receita por curso</div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Curso', 'Vendas', 'Receita'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {Object.values(byCourse)
              .sort((a, b) => b.revenue - a.revenue)
              .map(c => (
                <tr key={c.title}>
                  <td className="px-4 py-3 font-medium">{c.title}</td>
                  <td className="px-4 py-3">{c.count}</td>
                  <td className="px-4 py-3 text-brand-600 font-medium">{formatPrice(c.revenue)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Últimas vendas */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 font-semibold">Últimas vendas</div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Aluno', 'Curso', 'Valor', 'Data'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {payments.slice(0, 20).map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium">{p.profiles?.full_name ?? '—'}</p>
                  <p className="text-gray-400 text-xs">{p.profiles?.email ?? ''}</p>
                </td>
                <td className="px-4 py-3">{p.courses?.title ?? '—'}</td>
                <td className="px-4 py-3 font-medium text-brand-600">{formatPrice(p.amount_cents)}</td>
                <td className="px-4 py-3 text-gray-400">
                  {format(new Date(p.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {payments.length === 0 && (
          <p className="text-center py-10 text-gray-400">Nenhuma venda ainda.</p>
        )}
      </div>
    </div>
  )
}

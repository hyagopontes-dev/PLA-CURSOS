'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CadastroPage() {
  const supabase = createClient()
  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Se a sessão já foi criada (confirmação desativada no Supabase),
    // redireciona direto para a área do aluno
    if (data.session) {
      router.push('/minha-area')
      router.refresh()
      return
    }

    // Se confirmação de email está ativa, mostra mensagem
    router.push('/cadastro/confirmacao')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Criar sua conta</h1>
        <form onSubmit={handleSignup} className="space-y-4">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
          <div>
            <label className="label">Nome completo</label>
            <input type="text" className="input" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label className="label">E-mail</label>
            <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="label">Senha</label>
            <input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} minLength={6} required />
            <p className="text-xs text-gray-400 mt-1">Mínimo 6 caracteres</p>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          Já tem conta?{' '}
          <Link href="/login" className="text-brand-600 font-medium hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  )
}

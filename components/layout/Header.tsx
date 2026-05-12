import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import LogoutButton from './LogoutButton'

export default async function Header() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-brand-700">📚 Cursos</Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/cursos" className="text-gray-600 hover:text-gray-900">Cursos</Link>
          {user ? (
            <>
              <Link href="/minha-area" className="text-gray-600 hover:text-gray-900">Minha área</Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-600 hover:text-gray-900">Entrar</Link>
              <Link href="/cadastro" className="btn-primary py-2 px-4 text-sm">Cadastrar</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

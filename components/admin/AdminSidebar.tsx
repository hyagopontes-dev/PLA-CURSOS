'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const links = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/cursos', label: 'Cursos', icon: '📚' },
  { href: '/admin/alunos', label: 'Alunos', icon: '👥' },
  { href: '/admin/relatorios', label: 'Relatórios', icon: '📈' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-64 bg-gray-900 text-white fixed h-full flex flex-col">
      <div className="p-5 border-b border-gray-800">
        <Link href="/" className="text-lg font-bold">📚 Admin</Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map(l => (
          <Link key={l.href} href={l.href} className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            pathname === l.href ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          )}>
            <span>{l.icon}</span>{l.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <Link href="/" className="text-gray-400 hover:text-white text-sm">← Ver site</Link>
      </div>
    </aside>
  )
}

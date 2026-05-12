'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Profile } from '@/types/database'

const links = [
  { href: '/minha-area', label: 'Dashboard', icon: '🏠' },
  { href: '/perfil', label: 'Meu perfil', icon: '👤' },
  { href: '/cursos', label: 'Explorar cursos', icon: '📚' },
]

export default function StudentSidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  return (
    <aside className="w-64 bg-white border-r border-gray-200 fixed h-full flex flex-col">
      <div className="p-5 border-b border-gray-100">
        <Link href="/" className="text-lg font-bold text-brand-700">📚 Cursos</Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map(l => (
          <Link key={l.href} href={l.href} className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            pathname === l.href ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-100'
          )}>
            <span>{l.icon}</span>{l.label}
          </Link>
        ))}
      </nav>
      {profile && (
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-semibold">
              {(profile.full_name ?? profile.email)[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{profile.full_name ?? 'Aluno'}</p>
              <p className="text-xs text-gray-400 truncate">{profile.email}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}

'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()
  async function logout() {
    await createClient().auth.signOut()
    router.push('/')
    router.refresh()
  }
  return (
    <button onClick={logout} className="text-gray-500 hover:text-red-500 text-sm transition-colors">
      Sair
    </button>
  )
}

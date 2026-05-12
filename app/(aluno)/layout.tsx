import StudentSidebar from '@/components/layout/StudentSidebar'
import { createClient } from '@/lib/supabase/server'
import { Profile } from '@/types/database'

export default async function AlunoLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data } = await supabase.from('profiles').select('*').eq('id', user!.id).single()
  const profile = data as unknown as Profile | null

  return (
    <div className="flex min-h-screen">
      <StudentSidebar profile={profile} />
      <main className="flex-1 ml-64 p-8 bg-gray-50">{children}</main>
    </div>
  )
}

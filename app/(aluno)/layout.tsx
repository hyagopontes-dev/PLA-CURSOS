import StudentSidebar from '@/components/layout/StudentSidebar'
import { createClient } from '@/lib/supabase/server'

export default async function AlunoLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user!.id).single()

  return (
    <div className="flex min-h-screen">
      <StudentSidebar profile={profile} />
      <main className="flex-1 ml-64 p-8 bg-gray-50">{children}</main>
    </div>
  )
}

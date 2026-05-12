'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types/database'

export default function PerfilPage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          const p = data as unknown as Profile | null
          setProfile(p)
          setName(p?.full_name ?? '')
        })
    })
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('profiles') as any)
      .update({ full_name: name })
      .eq('id', profile.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (!profile) return <div className="animate-pulse h-40 bg-gray-200 rounded-xl" />

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Meu perfil</h1>
      <div className="card p-6">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Nome completo</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="label">E-mail</label>
            <input className="input" value={profile.email} disabled readOnly />
            <p className="text-xs text-gray-400 mt-1">O e-mail não pode ser alterado.</p>
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Salvando...' : saved ? '✓ Salvo!' : 'Salvar alterações'}
          </button>
        </form>
      </div>
    </div>
  )
}

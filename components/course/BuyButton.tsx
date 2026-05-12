'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/utils'

interface Props {
  courseId: string
  courseTitle: string
  priceCents: number
  isLoggedIn: boolean
}

export default function BuyButton({ courseId, courseTitle, priceCents, isLoggedIn }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleBuy() {
    if (!isLoggedIn) {
      router.push(`/login?redirect=${window.location.pathname}`)
      return
    }
    setLoading(true)
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else { alert(data.error ?? 'Erro ao iniciar checkout'); setLoading(false) }
  }

  return (
    <button onClick={handleBuy} disabled={loading} className="btn-primary w-full text-lg">
      {loading ? 'Redirecionando...' : `Comprar — ${formatPrice(priceCents)}`}
    </button>
  )
}

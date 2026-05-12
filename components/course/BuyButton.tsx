'use client'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/utils'

interface Props {
  courseId: string
  courseTitle: string
  priceCents: number
  isLoggedIn: boolean
}

export default function BuyButton({ priceCents, isLoggedIn }: Props) {
  const router = useRouter()

  function handleClick() {
    if (!isLoggedIn) {
      router.push(`/login?redirect=${window.location.pathname}`)
      return
    }
    alert('Pagamentos em breve! Entre em contato para obter acesso.')
  }

  return (
    <div className="space-y-3">
      <button onClick={handleClick} className="btn-primary w-full text-lg">
        {isLoggedIn ? `Comprar — ${formatPrice(priceCents)}` : 'Entrar para comprar'}
      </button>
      <p className="text-xs text-center text-gray-400">
        💳 Pagamentos serão habilitados em breve
      </p>
    </div>
  )
}

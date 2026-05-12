import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Redireciona em caso de erro do Supabase
  if (error) {
    const url = new URL('/login', origin)
    url.searchParams.set('error', errorDescription ?? error)
    return NextResponse.redirect(url)
  }

  // Supabase pode enviar 'next' ou 'redirect' como parâmetro de destino
  const next = searchParams.get('next') ?? searchParams.get('redirect') ?? '/minha-area'

  // Garante que o path é válido (começa com /)
  const safePath = next.startsWith('/') ? next : '/minha-area'

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (exchangeError) {
      const url = new URL('/login', origin)
      url.searchParams.set('error', 'Erro ao confirmar conta. Tente novamente.')
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.redirect(`${origin}${safePath}`)
}

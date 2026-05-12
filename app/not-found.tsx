import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 text-center">
      <div>
        <div className="text-8xl mb-6">404</div>
        <h1 className="text-3xl font-bold mb-3">Página não encontrada</h1>
        <p className="text-gray-500 mb-8">A página que você procura não existe ou foi removida.</p>
        <Link href="/" className="btn-primary inline-block">Voltar ao início</Link>
      </div>
    </div>
  )
}

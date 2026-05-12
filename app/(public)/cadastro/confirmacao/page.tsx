import Link from 'next/link'

export default function ConfirmacaoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card p-8 w-full max-w-md text-center">
        <div className="text-5xl mb-4">📧</div>
        <h1 className="text-2xl font-bold mb-2">Verifique seu e-mail</h1>
        <p className="text-gray-500 mb-2">
          Enviamos um link de confirmação para o seu e-mail.
        </p>
        <p className="text-gray-400 text-sm mb-6">
          Clique no link para ativar sua conta. Verifique também a pasta de spam.
        </p>
        <Link href="/login" className="btn-primary inline-block">Ir para o login</Link>
      </div>
    </div>
  )
}

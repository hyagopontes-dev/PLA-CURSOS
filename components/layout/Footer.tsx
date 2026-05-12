export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-10 px-4 mt-16">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-6 text-sm">
        <p className="text-white font-semibold">📚 Plataforma de Cursos</p>
        <div className="flex gap-6">
          <a href="/cursos" className="hover:text-white transition-colors">Cursos</a>
          <a href="/login" className="hover:text-white transition-colors">Entrar</a>
        </div>
        <p>© {new Date().getFullYear()} Todos os direitos reservados.</p>
      </div>
    </footer>
  )
}

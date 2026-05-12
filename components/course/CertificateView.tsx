'use client'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Props {
  studentName: string
  courseName: string
  completedAt: string
  enrollmentId: string
}

export default function CertificateView({ studentName, courseName, completedAt, enrollmentId }: Props) {
  const date = format(new Date(completedAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="flex justify-end mb-4">
        <button onClick={() => window.print()} className="btn-secondary text-sm">🖨️ Imprimir / Salvar PDF</button>
      </div>
      <div id="certificate" className="bg-white border-8 border-double border-brand-200 p-12 text-center shadow-lg print:shadow-none">
        <div className="text-5xl mb-6">🎓</div>
        <h1 className="text-3xl font-bold text-gray-400 tracking-widest uppercase mb-2">Certificado de Conclusão</h1>
        <div className="w-24 h-1 bg-brand-500 mx-auto my-6" />
        <p className="text-gray-500 mb-4">Certificamos que</p>
        <h2 className="text-4xl font-bold text-gray-900 mb-4">{studentName}</h2>
        <p className="text-gray-500 mb-2">concluiu com êxito o curso</p>
        <h3 className="text-2xl font-semibold text-brand-700 mb-6">"{courseName}"</h3>
        <p className="text-gray-400 text-sm mb-8">Concluído em {date}</p>
        <div className="border-t border-gray-200 pt-6 text-xs text-gray-300">
          ID de verificação: {enrollmentId}
        </div>
      </div>
    </div>
  )
}

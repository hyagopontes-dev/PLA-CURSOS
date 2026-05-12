'use client'

interface Props { url: string }

export default function PdfViewer({ url }: Props) {
  return (
    <div className="space-y-3">
      <div className="bg-gray-800 rounded-xl overflow-hidden" style={{ height: '70vh' }}>
        <iframe src={url} className="w-full h-full" title="PDF Viewer" />
      </div>
      <a href={url} target="_blank" rel="noopener noreferrer" className="btn-secondary inline-block text-sm">
        ⬇️ Baixar PDF
      </a>
    </div>
  )
}

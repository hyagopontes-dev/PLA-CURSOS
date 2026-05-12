import ReactMarkdown from 'react-markdown'

interface Props { content: string }

export default function MarkdownContent({ content }: Props) {
  return (
    <article className="prose prose-invert max-w-none text-gray-200
      prose-headings:text-white prose-a:text-brand-400
      prose-code:bg-gray-800 prose-code:px-1 prose-code:rounded
      prose-pre:bg-gray-800 prose-blockquote:border-brand-500">
      <ReactMarkdown>{content}</ReactMarkdown>
    </article>
  )
}

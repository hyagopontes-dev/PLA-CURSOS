import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { Course } from '@/types/database'

export default function CourseCard({ course }: { course: Course }) {
  return (
    <Link href={`/cursos/${course.slug}`} className="card hover:shadow-md transition-shadow block overflow-hidden group">
      {course.thumbnail_url ? (
        <img src={course.thumbnail_url} alt={course.title} className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300" />
      ) : (
        <div className="w-full aspect-video bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center text-4xl">📚</div>
      )}
      <div className="p-4">
        <p className="text-xs text-gray-400 mb-1">{course.instructor_name}</p>
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{course.description}</p>
        <div className="text-lg font-bold text-brand-600">{formatPrice(course.price_cents)}</div>
      </div>
    </Link>
  )
}

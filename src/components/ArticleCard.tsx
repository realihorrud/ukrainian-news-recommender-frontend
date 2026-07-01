import { useState } from 'react'
import type { Article } from '../types'
import CategoryBadge from './CategoryBadge'
import { useApi } from '../hooks/useApi'

type ArticleCardProps = {
  article: Article
  showMatchScore?: boolean
  onRate: (articleId: number, rating: 1 | -1) => void
  onRead: (articleId: number) => void
}

const DISMISS_DELAY_MS = 300

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function ArticleCard({
  article,
  onRate,
  onRead,
}: ArticleCardProps) {
  const { apiFetch } = useApi()
  const [removing, setRemoving] = useState(false)

  const startDismiss = () => {
    setRemoving(true)
    window.setTimeout(() => onRead(article.id), DISMISS_DELAY_MS)
  }

  const handleRate = (value: 1 | -1) => {
    if (removing) return
    onRate(article.id, value)
    startDismiss()
  }

  const handleTitleClick = () => {
    if (removing) return
    void apiFetch(`/articles/${article.id}/read`, { method: 'POST' }).catch(
      (error) => {
        console.error('Failed to mark article as read', error)
      },
    )
    startDismiss()
    window.open(article.url, '_blank')
  }

  return (
    <article
      className={`rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition-colors hover:border-zinc-300 ${
        removing ? 'animate-fade-out pointer-events-none' : ''
      }`}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <CategoryBadge category={article.category} />
        <span className="text-xs text-zinc-500">{article.source}</span>
        <span className="ml-auto text-xs text-zinc-600">
          {formatDate(article.published_at)}
        </span>
      </div>

      <button
        type="button"
        onClick={handleTitleClick}
        className="block w-full cursor-pointer text-left text-base font-medium leading-snug text-zinc-900 transition-colors hover:text-violet-700"
      >
        {article.title}
      </button>

      {article.summary && (
        <p
          className="mt-2 line-clamp-2 text-sm text-zinc-600"
          dangerouslySetInnerHTML={{ __html: article.summary }}
        />
      )}

      <div className="mt-4 flex items-center gap-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleRate(1)}
            disabled={removing}
            className="cursor-pointer flex items-center gap-1.5 rounded-md border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14 9V5a3 3 0 0 0-3-3l-1 4-3 3v11h11.28a2 2 0 0 0 1.977-1.694l1-7A2 2 0 0 0 19.28 9H14Z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 9H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
            </svg>
            Like
          </button>
          <button
            type="button"
            onClick={() => handleRate(-1)}
            disabled={removing}
            className="cursor-pointer flex items-center gap-1.5 rounded-md border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 15v4a3 3 0 0 0 3 3l1-4 3-3V4H5.72a2 2 0 0 0-1.977 1.694l-1 7A2 2 0 0 0 4.72 15H10Z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 15h3a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-3" />
            </svg>
            Dislike
          </button>
        </div>
      </div>
    </article>
  )
}

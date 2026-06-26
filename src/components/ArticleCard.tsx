import { useState } from 'react'
import type { Article } from '../types'
import CategoryBadge from './CategoryBadge'
import MatchScoreBar from './MatchScoreBar'

type ArticleCardProps = {
  article: Article
  showMatchScore?: boolean
  onRate: (articleId: number, rating: 1 | -1) => Promise<void>
  onRemoved: (articleId: number) => void
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function ArticleCard({
  article,
  showMatchScore = false,
  onRate,
  onRemoved,
}: ArticleCardProps) {
  const [removing, setRemoving] = useState(false)
  const [rating, setRating] = useState(false)

  const handleRate = async (value: 1 | -1) => {
    if (rating || removing) return
    setRating(true)
    try {
      await onRate(article.id, value)
      setRemoving(true)
      setTimeout(() => onRemoved(article.id), 300)
    } catch {
      setRating(false)
    }
  }

  return (
    <article
      className={`rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 transition-colors hover:border-zinc-700 ${
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

      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-base font-medium leading-snug text-zinc-100 transition-colors hover:text-white"
      >
        {article.title}
      </a>

      {showMatchScore && article.match_score !== null && (
        <MatchScoreBar score={article.match_score} />
      )}

      {article.summary && (
        <p className="mt-2 line-clamp-2 text-sm text-zinc-500" dangerouslySetInnerHTML={{__html: article.summary}}></p>
      )}

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => handleRate(1)}
          disabled={rating || removing}
          className="flex items-center gap-1.5 rounded-md border border-zinc-800 px-3 py-1.5 text-sm text-zinc-500 transition-colors hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-400 disabled:opacity-50 cursor-pointer"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
          Upvote
        </button>
        <button
          type="button"
          onClick={() => handleRate(-1)}
          disabled={rating || removing}
          className="flex items-center gap-1.5 rounded-md border border-zinc-800 px-3 py-1.5 text-sm text-zinc-500 transition-colors hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50 cursor-pointer"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          Downvote
        </button>
      </div>
    </article>
  )
}

import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ArticleCard from '../components/ArticleCard'
import Navbar from '../components/Navbar'
import { useApi } from '../hooks/useApi'
import type { Article, BrowseResponse, RatingResponse } from '../types'

export default function Browse() {
  const { apiFetch } = useApi()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const totalRef = useRef(0)
  const [ratedCount, setRatedCount] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await apiFetch<BrowseResponse>('/browse?per_source=4')
        if (!cancelled) {
          totalRef.current = data.articles.length
          setArticles(data.articles)
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load articles. Please try again.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [apiFetch])

  const handleRate = useCallback(
    async (articleId: number, rating: 1 | -1) => {
      await apiFetch<RatingResponse>('/ratings', {
        method: 'POST',
        body: JSON.stringify({ article_id: articleId, rating }),
      })
    },
    [apiFetch],
  )

  const handleRemoved = useCallback((articleId: number) => {
    setArticles((prev) => prev.filter((a) => a.id !== articleId))
    setRatedCount((prev) => prev + 1)
  }, [])

  const total = totalRef.current
  const allRated = !loading && total > 0 && articles.length === 0

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-zinc-100">Browse & Rate</h1>
          {!loading && total > 0 && (
            <span className="text-sm text-zinc-500">
              {ratedCount} / {total} rated
            </span>
          )}
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-violet-500" />
          </div>
        )}

        {error && (
          <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}

        {allRated && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-6 py-12 text-center">
            <p className="mb-4 text-zinc-300">All done!</p>
            <Link
              to="/feed"
              className="inline-flex rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-500"
            >
              Go see your feed
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onRate={handleRate}
              onRemoved={handleRemoved}
            />
          ))}
        </div>
      </main>
    </div>
  )
}

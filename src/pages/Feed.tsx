import { useCallback, useEffect, useState } from 'react'
import ArticleCard from '../components/ArticleCard'
import Navbar from '../components/Navbar'
import { useApi } from '../hooks/useApi'
import type { Article, FeedResponse, RatingResponse, SyncResponse } from '../types'

export default function Feed() {
  const { apiFetch } = useApi()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        await apiFetch<SyncResponse>('/users/sync', { method: 'POST' })
        const data = await apiFetch<FeedResponse>('/feed?limit=20')
        if (!cancelled) {
          setArticles(data.articles)
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load feed. Please try again.')
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
    (articleId: number, rating: 1 | -1) => {
      void apiFetch<RatingResponse>('/ratings', {
        method: 'POST',
        body: JSON.stringify({ article_id: articleId, rating }),
      }).catch((error) => {
        console.error('Failed to rate article', error)
      })
    },
    [apiFetch],
  )

  const handleDismiss = useCallback((articleId: number) => {
    setArticles((prev) => prev.filter((a) => a.id !== articleId))
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-6 text-xl font-semibold text-zinc-900">Your Feed</h1>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-200 border-t-violet-500" />
          </div>
        )}

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {!loading && !error && articles.length === 0 && (
          <div className="rounded-lg border border-zinc-200 bg-white px-6 py-12 text-center shadow-sm">
            <p className="text-zinc-600">
              Rate more articles in Browse to improve your feed
            </p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onRate={handleRate}
              onRead={handleDismiss}
            />
          ))}
        </div>
      </main>
    </div>
  )
}

import { useCallback, useEffect, useRef, useState } from 'react'
import ArticleCard from '../components/ArticleCard'
import Navbar from '../components/Navbar'
import { useApi } from '../hooks/useApi'
import type { Article, FeedResponse, RatingResponse, SyncResponse } from '../types'

const LIMIT = 20

function uniqueByArticleId(articles: Article[]): Article[] {
  const seen = new Set<number>()
  return articles.filter((article) => {
    if (seen.has(article.id)) return false
    seen.add(article.id)
    return true
  })
}

export default function Feed() {
  const { apiFetch } = useApi()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const loaderRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef(0)
  const hasMoreRef = useRef(true)
  const loadingMoreRef = useRef(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        await apiFetch<SyncResponse>('/users/sync', { method: 'POST' })
        const data = await apiFetch<FeedResponse>(`/feed?limit=${LIMIT}&offset=0`)
        if (!cancelled) {
          setArticles(uniqueByArticleId(data.articles))
          setHasMore(data.has_more)
          hasMoreRef.current = data.has_more
          setOffset(LIMIT)
          offsetRef.current = LIMIT
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

  useEffect(() => {
    hasMoreRef.current = hasMore
  }, [hasMore])

  useEffect(() => {
    loadingMoreRef.current = loadingMore
  }, [loadingMore])

  useEffect(() => {
    offsetRef.current = offset
  }, [offset])

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasMoreRef.current) return

    loadingMoreRef.current = true
    setLoadingMore(true)
    const currentOffset = offsetRef.current

    try {
      const data = await apiFetch<FeedResponse>(
        `/feed?limit=${LIMIT}&offset=${currentOffset}`,
      )
      setArticles((prev) => uniqueByArticleId([...prev, ...data.articles]))

      const nextOffset = currentOffset + LIMIT
      offsetRef.current = nextOffset
      setOffset(nextOffset)

      setHasMore(data.has_more)
      hasMoreRef.current = data.has_more
    } catch {
      setError('Failed to load feed. Please try again.')
    } finally {
      loadingMoreRef.current = false
      setLoadingMore(false)
    }
  }, [apiFetch])

  useEffect(() => {
    if (loading || error || !hasMore || loadingMore) return

    const node = loaderRef.current
    if (!node) return

    const observer = new IntersectionObserver((entries) => {
      const firstEntry = entries[0]
      if (!firstEntry?.isIntersecting) return
      void loadMore()
    })

    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [error, hasMore, loading, loadingMore, loadMore])

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

          {hasMore && <div ref={loaderRef} style={{ height: 1 }} />}

          {loadingMore && (
            <div
              style={{
                textAlign: 'center',
                padding: '24px',
                color: 'var(--muted)',
              }}
            >
              Завантаження...
            </div>
          )}

          {!hasMore && articles.length > 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '24px',
                color: 'var(--muted)',
              }}
            >
              Ви переглянули всі статті
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

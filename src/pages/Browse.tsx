import { useCallback, useEffect, useRef, useState } from 'react'
import ArticleCard from '../components/ArticleCard'
import Navbar from '../components/Navbar'
import { useApi } from '../hooks/useApi'
import type {
  Article,
  BrowseResponse,
  CategoriesResponse,
  RatingResponse,
} from '../types'

type BrowseStage = 'categories' | 'articles'
type CategoryItem = { name: string; count: number }

const STAGE_TRANSITION_MS = 300
const CATEGORY_DONE_MS = 1500

const CATEGORY_EMOJI_MAP: Record<string, string> = {
  'Війна та безпека': '🛡️',
  Політика: '🏛️',
  Економіка: '📈',
  Технології: '💻',
  Спорт: '⚽',
  Суспільство: '🤝',
}

function getCategoryEmoji(category: string | null): string {
  if (!category) return '📰'
  return CATEGORY_EMOJI_MAP[category] ?? '📰'
}

export default function Browse() {
  const { apiFetch } = useApi()
  const [stage, setStage] = useState<BrowseStage>('categories')
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [activeCategory, setActive] = useState<string | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [initialCount, setInitial] = useState(0)
  const [loading, setLoading] = useState(false)
  const [fading, setFading] = useState(false)
  const [showDone, setShowDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const transitionTimerRef = useRef<number | null>(null)
  const doneTimerRef = useRef<number | null>(null)

  const reviewedCount = Math.max(initialCount - articles.length, 0)

  const transitionTo = useCallback((nextStage: BrowseStage) => {
    if (transitionTimerRef.current !== null) {
      window.clearTimeout(transitionTimerRef.current)
    }

    setFading(true)
    transitionTimerRef.current = window.setTimeout(() => {
      setStage(nextStage)
      setFading(false)
      transitionTimerRef.current = null
    }, STAGE_TRANSITION_MS)
  }, [])

  useEffect(
    () => () => {
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current)
      }
      if (doneTimerRef.current !== null) {
        window.clearTimeout(doneTimerRef.current)
      }
    },
    [],
  )

  useEffect(() => {
    let cancelled = false

    async function loadCategories() {
      setLoading(true)
      setError(null)

      try {
        const data = await apiFetch<CategoriesResponse>('/browse/categories')
        if (!cancelled) {
          setCategories(data.categories)
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load categories. Please try again.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadCategories()
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

  const completeCategory = useCallback(
    (categoryName: string) => {
      setShowDone(true)
      setCategories((prev) =>
        prev.filter((category) => category.name !== categoryName),
      )

      if (doneTimerRef.current !== null) {
        window.clearTimeout(doneTimerRef.current)
      }

      doneTimerRef.current = window.setTimeout(() => {
        setShowDone(false)
        setActive(null)
        setArticles([])
        setInitial(0)
        transitionTo('categories')
        doneTimerRef.current = null
      }, CATEGORY_DONE_MS)
    },
    [transitionTo],
  )

  const handleDismiss = useCallback(
    (articleId: number) => {
      setArticles((prev) => {
        const nextArticles = prev.filter((a) => a.id !== articleId)

        if (
          nextArticles.length !== prev.length &&
          nextArticles.length === 0 &&
          activeCategory &&
          stage === 'articles'
        ) {
          completeCategory(activeCategory)
        }

        return nextArticles
      })
    },
    [activeCategory, completeCategory, stage],
  )

  const handleCategorySelect = useCallback(
    async (categoryName: string) => {
      if (loading) return

      setActive(categoryName)
      setShowDone(false)
      setError(null)
      setLoading(true)

      if (doneTimerRef.current !== null) {
        window.clearTimeout(doneTimerRef.current)
        doneTimerRef.current = null
      }

      try {
        const data = await apiFetch<BrowseResponse>(
          `/browse?category=${encodeURIComponent(categoryName)}&per_source=4`,
        )
        setInitial(data.articles.length)
        setArticles(data.articles)
        transitionTo('articles')
      } catch {
        setError('Failed to load articles. Please try again.')
      } finally {
        setLoading(false)
      }
    },
    [apiFetch, loading, transitionTo],
  )

  const handleBackToCategories = useCallback(() => {
    if (doneTimerRef.current !== null) {
      window.clearTimeout(doneTimerRef.current)
      doneTimerRef.current = null
    }

    setShowDone(false)
    setArticles([])
    setInitial(0)
    transitionTo('categories')
  }, [transitionTo])

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-8">
        {error && (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div
          className={`transition-opacity duration-300 ease-in-out ${
            fading ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {stage === 'categories' ? (
            <>
              {loading && categories.length === 0 ? (
                <div className="flex justify-center py-16">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-200 border-t-violet-500" />
                </div>
              ) : categories.length === 0 ? (
                <div className="flex min-h-[55vh] flex-col items-center justify-center text-center">
                  <p className="text-lg font-medium text-zinc-700">
                    Немає нових статей для оцінки
                  </p>
                  <p className="mt-2 text-sm text-zinc-500">Поверніться пізніше</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <h1 className="text-xl font-semibold text-zinc-900">
                    Оберіть категорію
                  </h1>

                  {loading && (
                    <div className="flex justify-center">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-200 border-t-violet-500" />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {categories.map((category) => {
                      const isSelected = category.name === activeCategory

                      return (
                        <button
                          key={category.name}
                          type="button"
                          disabled={loading}
                          onClick={() => void handleCategorySelect(category.name)}
                          className={`flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border px-3 py-4 text-center shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${
                            isSelected
                              ? 'border-violet-500 bg-violet-50'
                              : 'border-zinc-200 bg-white hover:border-violet-300 hover:bg-violet-50/40'
                          }`}
                        >
                          <span className="mb-2 text-3xl">
                            {getCategoryEmoji(category.name)}
                          </span>
                          <span className="text-lg font-semibold leading-tight text-zinc-900">
                            {category.name}
                          </span>
                          <span className="mt-2 text-sm text-zinc-500">
                            {category.count} articles
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div>
              <div className="mb-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleBackToCategories}
                  className="cursor-pointer rounded-md px-2 py-1 text-sm font-medium text-violet-700 transition-colors hover:bg-violet-50"
                >
                  ← Категорії
                </button>
                <span className="text-sm text-zinc-500">
                  {reviewedCount} / {initialCount} переглянуто
                </span>
              </div>

              {activeCategory && (
                <h1 className="mb-6 text-2xl font-semibold text-zinc-900">
                  {getCategoryEmoji(activeCategory)} {activeCategory}
                </h1>
              )}

              {showDone ? (
                <div className="rounded-lg border border-violet-200 bg-violet-50 px-6 py-10 text-center text-lg font-medium text-violet-700">
                  Готово! 🎉
                </div>
              ) : (
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
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

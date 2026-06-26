import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Navbar from '../components/Navbar'
import { useApi } from '../hooks/useApi'
import type { StatsResponse } from '../types'

const CHART_COLORS = ['#8b5cf6', '#6366f1', '#a78bfa', '#7c3aed', '#6d28d9']

export default function Stats() {
  const { apiFetch } = useApi()
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await apiFetch<StatsResponse>('/stats')
        if (!cancelled) {
          setStats(data)
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load stats. Please try again.')
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

  const chartData =
    stats?.top_categories.map((cat, i) => ({
      name: cat.name,
      count: cat.count,
      fill: CHART_COLORS[i % CHART_COLORS.length],
    })) ?? []

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-8 text-xl font-semibold text-zinc-900">Your Stats</h1>

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

        {stats && !loading && (
          <div className="flex flex-col gap-8">
            <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
              <p className="mb-1 text-sm text-zinc-500">Total articles rated</p>
              <p className="text-4xl font-semibold text-zinc-900">
                {stats.total_rated}
              </p>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-sm font-medium text-zinc-700">
                Top categories
              </h2>

              {stats.top_categories.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  Rate some articles to see your top categories.
                </p>
              ) : (
                <>
                  <ul className="mb-6 flex flex-col gap-3">
                    {stats.top_categories.slice(0, 3).map((cat, i) => (
                      <li
                        key={cat.name}
                        className="flex items-center justify-between"
                      >
                        <span className="flex items-center gap-2 text-sm text-zinc-700">
                          <span className="text-xs text-zinc-500">#{i + 1}</span>
                          {cat.name}
                        </span>
                        <span className="text-sm text-zinc-500">{cat.count}</span>
                      </li>
                    ))}
                  </ul>

                  {chartData.length > 0 && (
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} barSize={32}>
                          <XAxis
                            dataKey="name"
                            tick={{ fill: '#52525b', fontSize: 12 }}
                            axisLine={{ stroke: '#e4e4e7' }}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{ fill: '#52525b', fontSize: 12 }}
                            axisLine={{ stroke: '#e4e4e7' }}
                            tickLine={false}
                            allowDecimals={false}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#ffffff',
                              border: '1px solid #e4e4e7',
                              borderRadius: '8px',
                              color: '#18181b',
                              fontSize: '13px',
                            }}
                            cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                          />
                          <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

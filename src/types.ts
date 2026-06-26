export type Article = {
  id: number
  title: string
  summary: string | null
  url: string
  source: string
  category: string | null
  published_at: string
  match_score: number | null
}

export type CategoryCount = {
  name: string
  count: number
}

export type FeedResponse = {
  articles: Article[]
}

export type BrowseResponse = {
  articles: Article[]
}

export type RatingRequest = {
  article_id: number
  rating: 1 | -1
}

export type RatingResponse = {
  status: 'ok'
}

export type CategoriesResponse = {
  categories: CategoryCount[]
}

export type StatsResponse = {
  total_rated: number
  top_categories: CategoryCount[]
}

export type SyncResponse = {
  user_id: number
}

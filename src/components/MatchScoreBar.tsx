type MatchScoreBarProps = {
  score: number
}

export default function MatchScoreBar({ score }: MatchScoreBarProps) {
  const percent = Math.round(score * 100)

  return (
    <div className="mt-2">
      <div className="mb-1 flex items-center justify-between text-xs text-zinc-500">
        <span>Match</span>
        <span>{percent}%</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-violet-500 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

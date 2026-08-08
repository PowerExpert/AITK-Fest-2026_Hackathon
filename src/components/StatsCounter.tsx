import { useEffect, useState } from 'react'
import { supabase, supabaseConfigured } from '../lib/supabaseClient'

export default function StatsCounter() {
  const [count, setCount] = useState<number | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!supabaseConfigured) {
      setFailed(true)
      return
    }
    let cancelled = false
    // Uses a security-definer RPC (see supabase.sql) instead of a direct
    // table select, since row-level security only allows a logged-in user
    // to see their own resume checks — an anonymous landing-page visitor
    // needs the aggregate count, not access to the rows themselves.
    supabase
      .rpc('resume_checks_count')
      .then(({ data, error }) => {
        if (cancelled) return
        if (error || data == null) {
          setFailed(true)
          return
        }
        setCount(Number(data))
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Nothing to show yet, and nothing worth showing if it's zero or unreachable —
  // an empty/failed counter would undercut trust rather than build it.
  if (failed || count === null || count === 0) return null

  return (
    <div className="stats-counter">
      <span className="stats-counter__dot" />
      <span className="stats-counter__count">{count.toLocaleString('ru-RU')}</span>
      <span className="stats-counter__label">{count === 1 ? 'человеку уже помогли' : 'людям уже помогли'}</span>
    </div>
  )
}

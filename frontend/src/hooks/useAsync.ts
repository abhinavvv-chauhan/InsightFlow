import { useEffect, useState } from 'react'

export function useAsync<T>(fn: () => Promise<T>): { data: T | null; loading: boolean } {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    setLoading(true)
    fn().then((d) => {
      if (!alive) return
      setData(d)
      setLoading(false)
    })
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { data, loading }
}

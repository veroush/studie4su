import { useCallback, useEffect, useState } from "react"

const STORAGE_KEY = "school_compare"
const MAX_COMPARE = 3

function readStored(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : []
  } catch {
    return []
  }
}

// Shared compare-selection hook. Persists to localStorage so the
// selection survives reloads, matching v1's behavior. Built as a
// standalone hook (not local state inside SchoolFilters/CompareBar)
// because program-compare will need the identical pattern later.
export function useCompare() {
  const [ids, setIds] = useState<string[]>(() => readStored())

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
    } catch {
      // storage disabled/unavailable - fail silently, state still works in-memory
    }
  }, [ids])

  const isComparing = useCallback((id: string) => ids.includes(id), [ids])

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      if (prev.includes(id)) return prev.filter((existing) => existing !== id)
      if (prev.length >= MAX_COMPARE) return prev
      return [...prev, id]
    })
  }, [])

  const remove = useCallback((id: string) => {
    setIds((prev) => prev.filter((existing) => existing !== id))
  }, [])

  const clear = useCallback(() => setIds([]), [])

  return {
    ids,
    isComparing,
    toggle,
    remove,
    clear,
    atLimit: ids.length >= MAX_COMPARE,
    maxCompare: MAX_COMPARE,
  }
}

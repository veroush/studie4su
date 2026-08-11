import { useCallback } from "react"

const STORAGE_KEY = "program_compare"
const MAX_ITEMS = 3

function readIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]")
  } catch {
    return []
  }
}

function writeIds(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

export function useProgramCompare() {
  const addProgram = useCallback((programId: string) => {
    const ids = readIds()

    if (ids.includes(programId)) {
      window.location.href = `/program-compare?ids=${ids.join(",")}`
      return
    }

    if (ids.length >= MAX_ITEMS) {
      window.location.href = `/program-compare?ids=${ids.join(",")}&replace=${encodeURIComponent(programId)}`
      return
    }

    const next = [...ids, programId]
    writeIds(next)
    window.location.href = `/program-compare?ids=${next.join(",")}`
  }, [])

  return { addProgram }
}

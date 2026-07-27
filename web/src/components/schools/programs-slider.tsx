import { useCallback, useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { useProgramCompare } from "@/hooks/use-program-compare"

interface Program {
  id: string
  name: string
  description: string | null
  cluster: string
  duration: string | null
  levelRequired: string | null
  tuitionCost: string | null
  careers: string | null
}

interface ProgramsSliderProps {
  programs: Program[]
}

interface ClusterMeta {
  accent: string
  emoji: string
  label: string
  sparks: string[]
}

const CLUSTER_META: Record<string, ClusterMeta> = {
  TECH: { accent: "#3b82f6", emoji: "💻", label: "Technologie", sparks: ["Bouw software en systemen", "Werk aan netwerken & AI", "Los technische problemen op"] },
  BUS:  { accent: "#f59e0b", emoji: "📈", label: "Business", sparks: ["Leid projecten en teams", "Analyseer markten & cijfers", "Start je eigen onderneming"] },
  SCI:  { accent: "#10b981", emoji: "🔬", label: "Wetenschap", sparks: ["Onderzoek de wereld om je heen", "Ontdek nieuwe verbanden", "Draag bij aan kennisgroei"] },
  MED:  { accent: "#ef4444", emoji: "🩺", label: "Gezondheidszorg", sparks: ["Zorg voor mensen op hun kwetsbaarst", "Werk in een ziekenhuis of kliniek", "Maak levensreddend verschil"] },
  SOC:  { accent: "#8b5cf6", emoji: "🤝", label: "Sociale wetenschappen", sparks: ["Begrijp menselijk gedrag", "Werk met gemeenschappen", "Maak maatschappelijk impact"] },
  EDU:  { accent: "#f97316", emoji: "📚", label: "Onderwijs", sparks: ["Inspireer de volgende generatie", "Geef vorm aan de toekomst", "Werk in het onderwijs"] },
  LAW:  { accent: "#64748b", emoji: "⚖️", label: "Rechten", sparks: ["Verdedig rechten van mensen", "Werk in rechtspraak of beleid", "Navigeer complexe wetgeving"] },
}

function truncateTuition(t: string, max = 30) {
  if (t.length <= max) return { short: t, overflow: false }
  return { short: t.slice(0, max).trimEnd() + "…", overflow: true }
}

export function ProgramsSlider({ programs }: ProgramsSliderProps) {
  const { addProgram } = useProgramCompare()
  const viewportRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [visibleCount, setVisibleCount] = useState(3)
  const [cardWidth, setCardWidth] = useState(0)
  const [index, setIndex] = useState(0)
  const [animate, setAnimate] = useState(true)

  const total = programs.length
  const looped = total > 1 ? [...programs, ...programs] : programs

  const recalc = useCallback(() => {
    const w = viewportRef.current?.offsetWidth ?? 0
    const count = w >= 1024 ? 3 : w >= 640 ? 2 : 1
    setVisibleCount(count)
    setCardWidth(count > 0 ? w / count : 0)
  }, [])

  useEffect(() => {
    recalc()
    window.addEventListener("resize", recalc)
    return () => window.removeEventListener("resize", recalc)
  }, [recalc])

  const next = useCallback(() => {
    setAnimate(true)
    setIndex((i) => i + 1)
  }, [])
  const prev = useCallback(() => {
    setAnimate(true)
    setIndex((i) => i - 1)
  }, [])

  useEffect(() => {
    if (total < 2) return
    if (index >= total) {
      const t = setTimeout(() => {
        setAnimate(false)
        setIndex((i) => i - total)
      }, 500)
      return () => clearTimeout(t)
    }
    if (index < 0) {
      const t = setTimeout(() => {
        setAnimate(false)
        setIndex((i) => i + total)
      }, 500)
      return () => clearTimeout(t)
    }
  }, [index, total])

  const stopAuto = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])
  const startAuto = useCallback(() => {
    if (total < 2) return
    stopAuto()
    timerRef.current = setInterval(next, 3500)
  }, [next, stopAuto, total])

  useEffect(() => {
    startAuto()
    return stopAuto
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total])

  if (programs.length === 0) {
    return (
      <section className="bg-[#0d2b1f] py-12">
        <div className="max-w-[1280px] mx-auto px-8">
          <p className="text-white/50 text-sm">Geen opleidingen gevonden.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-[#0d2b1f] py-12 pb-16">
      <div className="max-w-[1280px] mx-auto px-8 mb-7 flex items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2.5">
          Aangeboden opleidingen
        </h2>
        {programs.length > 1 && (
          <span className="text-sm font-semibold text-white/45">
            {programs.length} opleidingen
          </span>
        )}
      </div>

      <div
        className="relative"
        ref={viewportRef}
        onMouseEnter={stopAuto}
        onMouseLeave={startAuto}
      >
        <div className="overflow-hidden" style={{ paddingBottom: 10 }}>
          <div
            className="flex"
            style={{
              transform: `translateX(-${index * cardWidth}px)`,
              transition: animate ? "transform .5s cubic-bezier(.4,0,.2,1)" : "none",
            }}
          >
            {looped.map((p, i) => {
              const meta = CLUSTER_META[p.cluster]
              const accent = meta?.accent ?? "#10b981"
              const emoji = meta?.emoji ?? "🎓"
              const label = meta?.label ?? p.cluster
              const sparks = meta?.sparks ?? []
              const tuitionRaw =
                p.tuitionCost && p.tuitionCost !== "0" && p.tuitionCost.toLowerCase() !== "free"
                  ? p.tuitionCost
                  : null
              const tuition = tuitionRaw ? truncateTuition(tuitionRaw) : null

              return (
                <div
                  key={`${p.id}-${i}`}
                  className="flex-shrink-0 px-2.5 box-border"
                  style={{ width: cardWidth || `${100 / visibleCount}%` }}
                >
                  <Link
                    to="/programs/$programId"
                    params={{ programId: p.id }}
                    className="relative rounded-[18px] overflow-hidden h-full flex flex-col shadow-lg hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-250 group"
                  >
                    <div className="h-[5px] w-full" style={{ background: accent }} />
                    <div className="bg-white/[0.07] border border-white/10 border-t-0 rounded-b-[18px] p-5 flex flex-col gap-2.5 flex-1 group-hover:bg-white/[0.11] group-hover:border-white/[0.18] transition-colors">
                      <span className="inline-flex w-fit items-center gap-1.5 text-[0.68rem] font-bold tracking-wide uppercase px-2.5 py-[3px] rounded-full bg-white/10 text-white/75">
                        <span>{emoji}</span> {label}
                      </span>
                      <h3 className="font-display text-[1.08rem] font-bold text-white leading-tight">
                        {p.name}
                      </h3>
                      <div className="flex flex-wrap gap-1.5 items-baseline">
                        {p.duration && (
                          <span className="px-2.5 py-[3px] rounded-full bg-[#16a34a] text-white text-xs font-medium whitespace-nowrap">
                            {p.duration}
                          </span>
                        )}
                        {tuition ? (
                          <span
                            className="px-2.5 py-[3px] rounded-full bg-white/10 text-white/80 text-xs font-medium"
                            title={tuitionRaw ?? undefined}
                          >
                            {tuition.short}
                          </span>
                        ) : (
                          <span className="px-2.5 py-[3px] rounded-full bg-white/10 text-white/80 text-xs font-medium">
                            Gratis (overheidsbekostiging)
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-[5px] flex-1 pt-0.5">
                        {sparks.slice(0, 3).map((s, si) => (
                          <span
                            key={si}
                            className="flex items-start gap-[7px] text-[0.78rem] text-white/65 leading-relaxed"
                          >
                            <span className="text-[#e8b84b] text-[0.72rem] mt-px opacity-80">→</span>
                            {s}
                          </span>
                        ))}
                      </div>
                      <div className="overflow-hidden max-h-0 opacity-0 group-hover:max-h-[60px] group-hover:opacity-100 transition-all duration-300">
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            addProgram(p.id)
                          }}
                          className="mt-2 inline-flex w-fit items-center gap-1.5 text-sm font-bold text-[#0d2b1f] bg-[#e8b84b] hover:opacity-90 px-4 py-2 rounded-lg transition-opacity"
                        >
                          Vergelijk opleiding
                        </button>
                      </div>
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>

        {programs.length > 1 && (
          <>
            <div className="absolute left-0 top-0 bottom-0 w-[72px] z-10 flex items-center justify-start pl-3 pointer-events-none bg-gradient-to-r from-[#0d2b1f]/55 to-transparent">
              <button
                onClick={prev}
                className="pointer-events-auto w-11 h-11 rounded-full border-2 border-white/20 bg-[#0d2b1f]/85 text-white flex items-center justify-center backdrop-blur hover:bg-[#16a34a] hover:border-[#16a34a] transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-[72px] z-10 flex items-center justify-end pr-3 pointer-events-none bg-gradient-to-l from-[#0d2b1f]/55 to-transparent">
              <button
                onClick={next}
                className="pointer-events-auto w-11 h-11 rounded-full border-2 border-white/20 bg-[#0d2b1f]/85 text-white flex items-center justify-center backdrop-blur hover:bg-[#16a34a] hover:border-[#16a34a] transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
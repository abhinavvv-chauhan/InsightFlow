import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Send,
  X,
  User,
  Loader2,
  AlertCircle,
  Code2,
  ChevronDown,
  RotateCcw,
} from 'lucide-react'
import clsx from 'clsx'

/* ─── Config ─── */
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

/* ─── Types ─── */
interface CopilotResponse {
  sql?: string
  data?: Record<string, unknown>[]
  finding?: string
  recommendation?: string
  error?: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
  payload?: CopilotResponse
  loading?: boolean
}

/* ─── Suggestions ─── */
const SUGGESTIONS = [
  'Top revenue product last week?',
  'Which city converts the most?',
  'Show funnel drop-off rates',
  'Device type driving most orders?',
]

/* ─── Mini Data Table ─── */
function MiniTable({ data }: { data: Record<string, unknown>[] }) {
  if (!data?.length) return null
  const headers = Object.keys(data[0])
  return (
    <div className="mt-2.5 overflow-x-auto rounded-lg border border-white/[0.06]">
      <table className="w-full text-[11px]">
        <thead>
          <tr className="border-b border-white/[0.06] bg-white/[0.02]">
            {headers.map((h) => (
              <th
                key={h}
                className="px-2.5 py-1.5 text-left font-semibold uppercase tracking-wider text-ink-muted"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 6).map((row, i) => (
            <tr
              key={i}
              className="border-b border-white/[0.04] last:border-0 transition-colors hover:bg-white/[0.02]"
            >
              {headers.map((h) => (
                <td key={h} className="px-2.5 py-1.5 text-ink-secondary tabular">
                  {String(row[h] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length > 6 && (
        <p className="px-2.5 py-1 text-[10px] text-ink-muted">
          +{data.length - 6} more rows
        </p>
      )}
    </div>
  )
}

/* ─── SQL Reveal ─── */
function SqlBlock({ sql }: { sql: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-1.5">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 text-[11px] text-ink-muted transition-colors hover:text-amber"
      >
        <Code2 className="size-3" />
        {open ? 'Hide SQL' : 'View SQL'}
        <ChevronDown
          className={clsx('size-3 transition-transform', open && 'rotate-180')}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.pre
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-1.5 overflow-x-auto rounded-lg bg-obsidian-950 p-2.5 text-[11px] leading-relaxed text-emerald font-mono ring-1 ring-white/[0.06]"
          >
            {sql}
          </motion.pre>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Assistant Message ─── */
function AssistantBubble({ msg }: { msg: Message }) {
  const { payload } = msg

  if (msg.loading) {
    return (
      <div className="flex items-start gap-2.5">
        <div className="grid size-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber to-amber-deep">
          <Sparkles className="size-3.5 text-obsidian-950" />
        </div>
        <div className="flex items-center gap-2 rounded-2xl rounded-tl-md bg-obsidian-800 px-3.5 py-2.5 text-[13px] text-ink-muted ring-1 ring-white/[0.06]">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-amber" />
          </span>
          Querying warehouse…
        </div>
      </div>
    )
  }

  if (payload?.error) {
    return (
      <div className="flex items-start gap-2.5">
        <div className="grid size-7 shrink-0 place-items-center rounded-full bg-red-500/20 ring-1 ring-red-500/30">
          <AlertCircle className="size-3.5 text-red-400" />
        </div>
        <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-red-500/10 px-3.5 py-2.5 text-[13px] text-red-300 ring-1 ring-red-500/20">
          {payload.error}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-2.5">
      <div className="grid size-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber to-amber-deep">
        <Sparkles className="size-3.5 text-obsidian-950" />
      </div>
      <div className="max-w-[88%] space-y-1">
        {payload?.finding && (
          <div className="rounded-2xl rounded-tl-md bg-obsidian-800 px-3.5 py-2.5 text-[13px] leading-relaxed text-ink-primary ring-1 ring-white/[0.06]">
            {payload.finding}
          </div>
        )}
        {payload?.data && payload.data.length > 0 && <MiniTable data={payload.data} />}
        {payload?.sql && <SqlBlock sql={payload.sql} />}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   ═══  Main Floating Widget Component  ═══
   ═══════════════════════════════════════════════ */
export function CopilotWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when panel opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [open])

  const submit = useCallback(
    async (question: string) => {
      if (!question.trim() || isLoading) return

      const userMsg: Message = { id: crypto.randomUUID(), role: 'user', text: question }
      const loadingMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: '',
        loading: true,
      }

      setMessages((prev) => [...prev, userMsg, loadingMsg])
      setInput('')
      setIsLoading(true)

      try {
        const res = await fetch(`${API_BASE}/api/copilot`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question }),
        })
        const data: CopilotResponse = await res.json()

        setMessages((prev) =>
          prev.map((m) =>
            m.id === loadingMsg.id
              ? { ...m, loading: false, text: data.finding ?? data.error ?? '', payload: data }
              : m
          )
        )
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === loadingMsg.id
              ? {
                  ...m,
                  loading: false,
                  payload: { error: 'Could not reach the API. Is the backend running?' },
                }
              : m
          )
        )
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading]
  )

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit(input)
    }
  }

  function resetChat() {
    setMessages([])
    setInput('')
  }

  const isEmpty = messages.length === 0

  return (
    <>
      {/* ─── Backdrop ─── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[998] bg-black/20 backdrop-blur-[2px] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* ─── Chat Panel ─── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={clsx(
              'fixed z-[999] flex flex-col overflow-hidden rounded-2xl border border-white/[0.08]',
              'bg-obsidian-900/95 shadow-[0_24px_80px_-16px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.04)_inset] backdrop-blur-xl',
              // Desktop: anchored bottom-right, above FAB
              'bottom-24 right-6 hidden h-[560px] w-[420px] md:flex',
              // Mobile: near-fullscreen
              'max-md:inset-3 max-md:bottom-3 max-md:flex max-md:h-auto max-md:w-auto',
            )}
          >
            {/* ── Header ── */}
            <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-amber to-amber-deep shadow-glow-amber">
                  <Sparkles className="size-4 text-obsidian-950" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-sm font-semibold leading-tight">AI Copilot</h2>
                  <p className="text-[11px] text-ink-muted">SQL-backed answers from your warehouse</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={resetChat}
                    className="grid size-8 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-white/[0.06] hover:text-ink-primary"
                    aria-label="Reset conversation"
                    title="Reset conversation"
                  >
                    <RotateCcw className="size-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="grid size-8 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-white/[0.06] hover:text-ink-primary"
                  aria-label="Close"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* ── Messages ── */}
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              {isEmpty ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex h-full flex-col items-center justify-center gap-5 text-center"
                >
                  <div className="space-y-1.5">
                    <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-amber/10 ring-1 ring-amber/20">
                      <Sparkles className="size-6 text-amber" />
                    </div>
                    <p className="text-sm font-medium">What can I look up?</p>
                    <p className="max-w-[260px] text-xs text-ink-muted leading-relaxed">
                      Ask any business question. I'll write SQL, query your warehouse, and summarize
                      the result.
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5 w-full max-w-[300px]">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => submit(s)}
                        className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-left text-xs text-ink-secondary transition-all hover:border-amber/25 hover:bg-amber/[0.04] hover:text-ink-primary"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {msg.role === 'user' ? (
                          <div className="flex items-start justify-end gap-2">
                            <div className="max-w-[80%] rounded-2xl rounded-tr-md bg-amber/10 px-3.5 py-2.5 text-[13px] text-ink-primary ring-1 ring-amber/20">
                              {msg.text}
                            </div>
                            <div className="grid size-7 shrink-0 place-items-center rounded-full border border-white/[0.08] bg-obsidian-800">
                              <User className="size-3.5 text-ink-muted" />
                            </div>
                          </div>
                        ) : (
                          <AssistantBubble msg={msg} />
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={bottomRef} />
                </div>
              )}
            </div>

            {/* ── Input ── */}
            <div className="shrink-0 border-t border-white/[0.06] px-3 py-3">
              <div className="flex items-end gap-2 rounded-xl bg-obsidian-950/80 px-3 py-2 ring-1 ring-white/[0.06] transition-all focus-within:ring-amber/25">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  rows={1}
                  placeholder="Ask a question…"
                  disabled={isLoading}
                  className="max-h-24 min-h-[1.25rem] flex-1 resize-none bg-transparent text-[13px] text-ink-primary placeholder:text-ink-muted focus:outline-none disabled:opacity-50"
                  style={{ fieldSizing: 'content' } as React.CSSProperties}
                />
                <button
                  onClick={() => submit(input)}
                  disabled={!input.trim() || isLoading}
                  className={clsx(
                    'grid size-7 shrink-0 place-items-center rounded-lg transition-all',
                    input.trim() && !isLoading
                      ? 'bg-amber text-obsidian-950 shadow-glow-amber hover:bg-amber-deep'
                      : 'bg-white/[0.04] text-ink-muted'
                  )}
                  aria-label="Send"
                >
                  {isLoading ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Send className="size-3.5" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Floating Action Button ─── */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className={clsx(
          'fixed bottom-6 right-6 z-[1000] grid size-14 place-items-center rounded-full',
          'bg-gradient-to-br from-amber to-amber-deep shadow-glow-amber',
          'transition-shadow hover:shadow-[0_0_48px_-4px_rgba(245,158,11,0.5)]',
          // On mobile, push above the bottom dock
          'max-md:bottom-[88px]',
        )}
        aria-label={open ? 'Close AI Copilot' : 'Open AI Copilot'}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="size-6 text-obsidian-950" strokeWidth={2.5} />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Sparkles className="size-6 text-obsidian-950" strokeWidth={2.5} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  )
}

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Send, User, Loader2, AlertCircle, Code2, Sparkles } from 'lucide-react'
import clsx from 'clsx'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

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

const SUGGESTIONS = [
  'What was the top revenue-generating product last week?',
  'Which city had the highest conversion rate?',
  'Show me the drop-off at each funnel step',
  'What device type drives the most orders?',
]

function TableView({ data }: { data: Record<string, unknown>[] }) {
  if (!data?.length) return null
  const headers = Object.keys(data[0])
  return (
    <div className="mt-3 overflow-x-auto rounded-xl border border-hairline">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-hairline bg-white/[0.03]">
            {headers.map((h) => (
              <th key={h} className="px-3 py-2 text-left font-semibold uppercase tracking-wider text-ink-muted">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 10).map((row, i) => (
            <tr key={i} className="border-b border-hairline/60 last:border-0 hover:bg-white/[0.02]">
              {headers.map((h) => (
                <td key={h} className="px-3 py-2 text-ink-secondary">
                  {String(row[h] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length > 10 && (
        <p className="px-3 py-2 text-xs text-ink-muted">
          Showing 10 of {data.length} rows
        </p>
      )}
    </div>
  )
}

function AssistantBubble({ msg }: { msg: Message }) {
  const [showSql, setShowSql] = useState(false)
  const { payload } = msg

  if (msg.loading) {
    return (
      <div className="flex items-start gap-3">
        <div className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber to-amber-deep shadow-glow-amber">
          <Bot className="size-4 text-obsidian-950" />
        </div>
        <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-hairline bg-obsidian-900/60 px-4 py-3 text-sm text-ink-muted">
          <Loader2 className="size-4 animate-spin text-amber" />
          Thinking…
        </div>
      </div>
    )
  }

  if (payload?.error) {
    return (
      <div className="flex items-start gap-3">
        <div className="grid size-8 shrink-0 place-items-center rounded-full bg-red-500/20 border border-red-500/30">
          <AlertCircle className="size-4 text-red-400" />
        </div>
        <div className="rounded-2xl rounded-tl-sm border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {payload.error}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3">
      <div className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber to-amber-deep shadow-glow-amber">
        <Bot className="size-4 text-obsidian-950" />
      </div>
      <div className="max-w-[85%] space-y-2">
        {/* Finding */}
        {payload?.finding && (
          <div className="rounded-2xl rounded-tl-sm border border-hairline bg-obsidian-900/60 px-4 py-3 text-sm text-ink-primary leading-relaxed">
            <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-amber">
              <Sparkles className="size-3" /> Insight
            </div>
            {payload.finding}
          </div>
        )}

        {/* Data table */}
        {payload?.data && payload.data.length > 0 && (
          <TableView data={payload.data} />
        )}

        {/* SQL toggle */}
        {payload?.sql && (
          <div>
            <button
              onClick={() => setShowSql((s) => !s)}
              className="flex items-center gap-1.5 text-xs text-ink-muted transition-colors hover:text-amber"
            >
              <Code2 className="size-3" />
              {showSql ? 'Hide SQL' : 'View generated SQL'}
            </button>
            <AnimatePresence>
              {showSql && (
                <motion.pre
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 overflow-x-auto rounded-xl border border-hairline bg-obsidian-950 p-3 text-xs text-emerald-400 font-mono"
                >
                  {payload.sql}
                </motion.pre>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

export function Copilot() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function submit(question: string) {
    if (!question.trim() || isLoading) return

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', text: question }
    const loadingMsg: Message = { id: crypto.randomUUID(), role: 'assistant', text: '', loading: true }

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
            ? { ...m, loading: false, payload: { error: 'Could not reach the API. Is the backend running?' } }
            : m
        )
      )
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit(input)
    }
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col">
      {/* Header */}
      <div className="shrink-0 pb-4">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-amber to-amber-deep shadow-glow-amber">
            <Bot className="size-5 text-obsidian-950" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">AI Copilot</h1>
            <p className="text-sm text-ink-muted">Ask questions in plain English — get SQL-backed answers</p>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="min-h-0 flex-1 overflow-y-auto pb-4">
        {isEmpty ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex h-full flex-col items-center justify-center gap-6 text-center"
          >
            <div className="space-y-2">
              <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-amber/10 ring-1 ring-amber/20">
                <Sparkles className="size-8 text-amber" />
              </div>
              <p className="text-lg font-medium">What would you like to know?</p>
              <p className="max-w-sm text-sm text-ink-muted">
                Ask any business question. The Copilot translates it to SQL, queries the warehouse,
                and gives you a plain-English answer.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => submit(s)}
                  className="rounded-xl border border-hairline bg-obsidian-900/60 px-4 py-3 text-left text-sm text-ink-secondary transition-all hover:border-amber/30 hover:bg-amber/[0.05] hover:text-ink-primary"
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6 py-2">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {msg.role === 'user' ? (
                    <div className="flex items-start justify-end gap-3">
                      <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-amber/10 px-4 py-3 text-sm text-ink-primary ring-1 ring-amber/20">
                        {msg.text}
                      </div>
                      <div className="grid size-8 shrink-0 place-items-center rounded-full border border-hairline bg-obsidian-900">
                        <User className="size-4 text-ink-secondary" />
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

      {/* Input bar */}
      <div className="shrink-0 pt-2">
        <div className="flex items-end gap-3 rounded-2xl border border-hairline bg-obsidian-900/80 px-4 py-3 ring-1 ring-transparent transition-all focus-within:border-amber/30 focus-within:ring-amber/10">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            placeholder="Ask a business question… (Enter to send)"
            disabled={isLoading}
            className="max-h-40 min-h-[1.5rem] flex-1 resize-none bg-transparent text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none disabled:opacity-50"
            style={{ fieldSizing: 'content' } as React.CSSProperties}
          />
          <button
            onClick={() => submit(input)}
            disabled={!input.trim() || isLoading}
            className={clsx(
              'grid size-8 shrink-0 place-items-center rounded-xl transition-all',
              input.trim() && !isLoading
                ? 'bg-amber text-obsidian-950 shadow-glow-amber hover:bg-amber-deep'
                : 'bg-white/[0.06] text-ink-muted'
            )}
            aria-label="Send"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-ink-muted">
          Answers are generated from your live PostgreSQL warehouse · SQL is shown for full transparency
        </p>
      </div>
    </div>
  )
}

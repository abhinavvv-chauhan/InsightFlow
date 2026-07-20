import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  createColumnHelper,
  flexRender,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowUpDown, ArrowUp, ArrowDown, Search, Crown } from 'lucide-react'
import { PageHeader } from '../components/layout/PageHeader'
import { SpotlightCard } from '../components/ui/SpotlightCard'
import { Skeleton, ChartSkeleton } from '../components/ui/Skeleton'
import { Sparkline } from '../components/charts/Sparkline'
import { EChart } from '../components/charts/EChart'
import { pageStagger } from '../components/ui/motion'
import { useAsync } from '../hooks/useAsync'
import { api } from '../data/api'
import { series, ink, chartFont, monoFont, tooltipCss } from '../lib/palette'
import { money, moneyFull, pct } from '../lib/format'
import type { ProductRow } from '../data/types'

const col = createColumnHelper<ProductRow>()

export function Products() {
  const { data, loading } = useAsync(() => api.product())
  return (
    <>
      <PageHeader
        title="Product Leaderboard"
        subtitle="Revenue ranking · 12-week trend per product · click headers to sort"
      />
      <motion.div variants={pageStagger} initial="hidden" animate="show" className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <SpotlightCard interactive={false} className="p-0 xl:col-span-2">
          {loading || !data ? (
            <div className="flex flex-col gap-3 p-6" aria-busy>
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : (
            <LeaderboardTable rows={data.products} />
          )}
        </SpotlightCard>

        <SpotlightCard interactive={false} className="h-fit p-5 sm:p-6">
          <h2 className="text-sm font-semibold">Revenue by category</h2>
          <p className="mb-2 text-xs text-ink-muted">Last 30 days</p>
          {loading || !data ? <ChartSkeleton height={330} /> : <CategoryBars categories={data.categories} />}
        </SpotlightCard>
      </motion.div>
    </>
  )
}

function LeaderboardTable({ rows }: { rows: ProductRow[] }) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'revenue', desc: true }])
  const [globalFilter, setGlobalFilter] = useState('')

  const columns = useMemo(
    () => [
      col.accessor('name', {
        header: 'Product',
        cell: (info) => (
          <div className="flex min-w-0 items-center gap-2.5">
            {info.row.index === 0 && sortingIsRevenueDesc(info.table.getState().sorting) && (
              <Crown className="size-4 shrink-0 text-amber" aria-label="Top product" />
            )}
            <div className="min-w-0">
              <div className="truncate font-medium text-ink-primary">{info.getValue()}</div>
              <div className="text-xs text-ink-muted">{info.row.original.category}</div>
            </div>
          </div>
        ),
      }),
      col.accessor('revenue', {
        header: 'Revenue',
        cell: (info) => (
          <span className="tabular font-mono font-semibold">{moneyFull(info.getValue())}</span>
        ),
      }),
      col.accessor('units', {
        header: 'Units',
        cell: (info) => <span className="tabular font-mono text-ink-secondary">{info.getValue().toLocaleString()}</span>,
      }),
      col.accessor('conversionPct', {
        header: 'Conv.',
        cell: (info) => <span className="tabular font-mono text-ink-secondary">{pct(info.getValue(), 2)}</span>,
      }),
      col.accessor('trend', {
        header: 'Revenue trend',
        enableSorting: false,
        cell: (info) => <Sparkline data={info.getValue()} color="auto" />,
      }),
    ],
    [],
  )

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div>
      {/* search */}
      <div className="flex items-center gap-2 border-b border-hairline px-5 py-3.5">
        <Search className="size-4 text-ink-muted" />
        <input
          id="product-filter"
          name="product-filter"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Filter products…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-ink-muted"
          aria-label="Filter products"
        />
      </div>

      <div className="max-h-[620px] overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-obsidian-900/95 backdrop-blur">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-hairline">
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const dir = header.column.getIsSorted()
                  return (
                    <th
                      key={header.id}
                      className="whitespace-nowrap px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-ink-muted"
                    >
                      {canSort ? (
                        <button
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1.5 transition-colors hover:text-ink-primary"
                          aria-label={`Sort by ${String(header.column.columnDef.header)}`}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {dir === 'asc' ? (
                            <ArrowUp className="size-3 text-amber" />
                          ) : dir === 'desc' ? (
                            <ArrowDown className="size-3 text-amber" />
                          ) : (
                            <ArrowUpDown className="size-3 opacity-50" />
                          )}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {table.getRowModel().rows.map((row) => (
                <motion.tr
                  key={row.original.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 36 }}
                  className="border-b border-hairline/60 transition-colors hover:bg-white/[0.025]"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-5 py-3.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        {table.getRowModel().rows.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-ink-muted">No products match “{globalFilter}”.</div>
        )}
      </div>
    </div>
  )
}

function sortingIsRevenueDesc(sorting: SortingState) {
  return sorting.length === 1 && sorting[0].id === 'revenue' && sorting[0].desc
}

function CategoryBars({ categories }: { categories: { name: string; revenue: number }[] }) {
  const sorted = [...categories].sort((a, b) => a.revenue - b.revenue)
  const option = useMemo(
    () => ({
      textStyle: { fontFamily: chartFont },
      grid: { left: 108, right: 60, top: 8, bottom: 28 },
      xAxis: {
        type: 'value',
        splitNumber: 2,
        splitLine: { lineStyle: { color: ink.grid } },
        axisLabel: {
          color: ink.muted,
          fontFamily: monoFont,
          fontSize: 10,
          formatter: (v: number) => money(v),
        },
      },
      yAxis: {
        type: 'category',
        data: sorted.map((c) => c.name),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: ink.secondary, fontSize: 12 },
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'transparent',
        borderWidth: 0,
        padding: 0,
        extraCssText: tooltipCss,
        formatter: (p: unknown) => {
          const { name, value } = p as { name: string; value: number }
          const el = document.createElement('div')
          const label = document.createElement('div')
          label.style.cssText = `color:${ink.secondary};font-size:11px`
          label.textContent = name
          const val = document.createElement('div')
          val.style.cssText = `color:${ink.primary};font-size:15px;font-weight:600;font-family:${monoFont}`
          val.textContent = moneyFull(value)
          el.append(label, val)
          return el
        },
      },
      series: [
        {
          type: 'bar',
          data: sorted.map((c) => c.revenue),
          barMaxWidth: 18,
          itemStyle: { color: series[0], borderRadius: [0, 4, 4, 0] },
          emphasis: { itemStyle: { color: '#10B981' } },
          label: {
            show: true,
            position: 'right',
            color: ink.secondary,
            fontFamily: monoFont,
            fontSize: 11,
            formatter: (p: { value: number }) => money(p.value),
          },
          animationDelay: (idx: number) => idx * 90,
          animationDuration: 800,
          animationEasing: 'cubicOut' as const,
        },
      ],
    }),
    [sorted],
  )
  return <EChart option={option} height={330} />
}

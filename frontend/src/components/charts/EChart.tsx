import { useEffect, useRef } from 'react'
import * as echarts from 'echarts/core'
import { LineChart, BarChart, PieChart, HeatmapChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  DataZoomComponent,
  VisualMapComponent,
  LegendComponent,
  BrushComponent,
  ToolboxComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsCoreOption, ECharts } from 'echarts/core'

echarts.use([
  LineChart,
  BarChart,
  PieChart,
  HeatmapChart,
  GridComponent,
  TooltipComponent,
  DataZoomComponent,
  VisualMapComponent,
  LegendComponent,
  BrushComponent,
  ToolboxComponent,
  CanvasRenderer,
])

interface EChartProps {
  option: EChartsCoreOption
  height?: number | string
  className?: string
  onReady?: (chart: ECharts) => void
  /** replace instead of merge when option changes */
  notMerge?: boolean
}

export function EChart({ option, height = 300, className, onReady, notMerge = false }: EChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<ECharts | null>(null)
  const onReadyRef = useRef(onReady)
  onReadyRef.current = onReady

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const chart = echarts.init(el, undefined, { renderer: 'canvas' })
    chartRef.current = chart
    onReadyRef.current?.(chart)

    const ro = new ResizeObserver(() => chart.resize())
    ro.observe(el)
    return () => {
      ro.disconnect()
      chart.dispose()
      chartRef.current = null
    }
  }, [])

  useEffect(() => {
    chartRef.current?.setOption(option, { notMerge })
  }, [option, notMerge])

  return <div ref={containerRef} className={className} style={{ height, width: '100%' }} />
}

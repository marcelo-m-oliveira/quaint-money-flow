import { useTheme } from 'next-themes'
import { useMemo } from 'react'

export interface ChartDataItem {
  name: string
  value: number
  color: string
  [key: string]: any
}

export interface UseChartConfigOptions {
  data: ChartDataItem[]
  type: 'doughnut' | 'line' | 'bar'
  showLegend?: boolean
  showTooltip?: boolean
  height?: number
}

export function useChartConfig({
  data,
  type,
  showLegend = true,
  showTooltip = true,
  height = 300,
}: UseChartConfigOptions) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const chartConfig = useMemo(() => {
    const baseConfig = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: showLegend,
          position: 'bottom' as const,
          labels: {
            color: isDark ? '#e5e7eb' : '#374151',
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12,
            },
          },
        },
        tooltip: {
          enabled: showTooltip,
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          titleColor: isDark ? '#f9fafb' : '#111827',
          bodyColor: isDark ? '#e5e7eb' : '#374151',
          borderColor: isDark ? '#374151' : '#e5e7eb',
          borderWidth: 1,
        },
      },
    }

    if (type === 'doughnut') {
      return {
        ...baseConfig,
        cutout: '60%',
        plugins: {
          ...baseConfig.plugins,
          legend: {
            ...baseConfig.plugins.legend,
            position: 'right' as const,
          },
        },
      }
    }

    if (type === 'line' || type === 'bar') {
      return {
        ...baseConfig,
        scales: {
          x: {
            grid: {
              color: isDark ? '#374151' : '#f3f4f6',
            },
            ticks: {
              color: isDark ? '#e5e7eb' : '#374151',
            },
          },
          y: {
            grid: {
              color: isDark ? '#374151' : '#f3f4f6',
            },
            ticks: {
              color: isDark ? '#e5e7eb' : '#374151',
            },
          },
        },
      }
    }

    return baseConfig
  }, [type, isDark, showLegend, showTooltip])

  const chartData = useMemo(() => {
    if (type === 'doughnut') {
      return {
        labels: data.map((item) => item.name),
        datasets: [
          {
            data: data.map((item) => item.value),
            backgroundColor: data.map((item) => item.color),
            borderWidth: 0,
          },
        ],
      }
    }

    if (type === 'line') {
      return {
        labels: data.map((item) => item.name),
        datasets: [
          {
            label: 'Valor',
            data: data.map((item) => item.value),
            borderColor: data[0]?.color || '#3b82f6',
            backgroundColor: `${data[0]?.color || '#3b82f6'}20`,
            fill: true,
            tension: 0.4,
          },
        ],
      }
    }

    if (type === 'bar') {
      return {
        labels: data.map((item) => item.name),
        datasets: [
          {
            label: 'Valor',
            data: data.map((item) => item.value),
            backgroundColor: data.map((item) => item.color),
            borderRadius: 4,
          },
        ],
      }
    }

    return { labels: [], datasets: [] }
  }, [data, type])

  return {
    chartConfig,
    chartData,
    containerStyle: { height: `${height}px` },
  }
}

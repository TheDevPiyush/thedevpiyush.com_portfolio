"use client"

import { useState } from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipProps } from "recharts"
import { cn } from "@/lib/utils"

export interface DailyPoint {
  day: string
  views: number
  visitors: number
}

type Metric = "views" | "visitors"

const METRIC_LABEL: Record<Metric, string> = { views: "Page views", visitors: "Visitors" }

function shortDay(day: string) {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })
}

function ChartTooltip({ active, payload, metric }: TooltipProps<number, string> & { metric: Metric }) {
  const point = payload?.[0]?.payload as DailyPoint | undefined
  if (!active || !point) return null
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 text-muted-foreground">{shortDay(point.day)}</p>
      <p className="flex items-center gap-2 text-popover-foreground">
        <span className="h-2 w-2 rounded-full bg-brand" />
        <span className="font-medium tabular-nums">{point[metric].toLocaleString("en-US")}</span>
        {METRIC_LABEL[metric].toLowerCase()}
      </p>
    </div>
  )
}

// One series at a time (views or visitors) so the chart never needs a legend or a second axis.
export function TrafficChart({ data, height = 260 }: { data: DailyPoint[]; height?: number }) {
  const [metric, setMetric] = useState<Metric>("views")
  const [showTable, setShowTable] = useState(false)
  const total = data.reduce((sum, point) => sum + point[metric], 0)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full border p-0.5 text-xs" role="tablist" aria-label="Metric">
          {(Object.keys(METRIC_LABEL) as Metric[]).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={metric === key}
              onClick={() => setMetric(key)}
              className={cn(
                "rounded-full px-3 py-1 transition-colors",
                metric === key ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {METRIC_LABEL[key]}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => setShowTable((value) => !value)} className="text-xs text-muted-foreground hover:text-foreground">
          {showTable ? "Show chart" : "Show table"}
        </button>
      </div>

      {showTable ? (
        <div className="max-h-[260px] overflow-y-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-muted text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Day</th>
                <th className="px-3 py-2 text-right font-medium">Page views</th>
                <th className="px-3 py-2 text-right font-medium">Visitors</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {[...data].reverse().map((point) => (
                <tr key={point.day}>
                  <td className="px-3 py-1.5">{shortDay(point.day)}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">{point.views.toLocaleString("en-US")}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">{point.visitors.toLocaleString("en-US")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ height }} role="img" aria-label={`${METRIC_LABEL[metric]} per day: ${total.toLocaleString("en-US")} in total`}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
              <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeWidth={1} />
              <XAxis
                dataKey="day"
                tickFormatter={shortDay}
                tickLine={false}
                axisLine={false}
                minTickGap={24}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                width={44}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip
                content={<ChartTooltip metric={metric} />}
                cursor={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey={metric}
                stroke="hsl(var(--brand))"
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
                fill="hsl(var(--brand))"
                fillOpacity={0.1}
                activeDot={{ r: 4, fill: "hsl(var(--brand))", stroke: "hsl(var(--card))", strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

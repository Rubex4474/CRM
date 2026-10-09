"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDateShort } from "@/lib/utils";
import { ChartTooltipContent } from "./chart-tooltip";
import { CHART_AXIS, CHART_GRID } from "./chart-colors";

export function NovosLeadsChart({ dados }: { dados: { data: string; quantidade: number }[] }) {
  const formatados = dados.map((d) => ({ ...d, label: formatDateShort(d.data) }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={formatados} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="novosLeadsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={CHART_GRID} />
        <XAxis dataKey="label" stroke={CHART_AXIS} fontSize={12} tickLine={false} axisLine={false} interval={1} />
        <YAxis allowDecimals={false} stroke={CHART_AXIS} fontSize={12} tickLine={false} axisLine={false} width={32} />
        <Tooltip content={ChartTooltipContent} />
        <Area
          type="monotone"
          dataKey="quantidade"
          name="Novos leads"
          stroke="#38BDF8"
          strokeWidth={2}
          fill="url(#novosLeadsGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

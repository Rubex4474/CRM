"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDateShort } from "@/lib/utils";
import { ChartTooltipContent } from "./chart-tooltip";
import { CHART_AXIS, CHART_GRID } from "./chart-colors";

export function NovosLeadsChart({ dados }: { dados: { data: string; quantidade: number }[] }) {
  const formatados = dados.map((d) => ({ ...d, label: formatDateShort(d.data) }));
  const totalPeriodo = dados.reduce((soma, d) => soma + d.quantidade, 0);

  return (
    <div>
      <p className="mb-2 flex items-baseline gap-1.5">
        <span className="font-heading text-2xl font-bold tabular-nums leading-none">{totalPeriodo}</span>
        <span className="text-xs text-muted-foreground">novo{totalPeriodo === 1 ? "" : "s"} no período</span>
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={formatados} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="novosLeadsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22D3EE" stopOpacity={0.55} />
              <stop offset="100%" stopColor="#22D3EE" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={CHART_GRID} />
          <XAxis dataKey="label" stroke={CHART_AXIS} fontSize={12} tickLine={false} axisLine={false} interval={1} />
          <YAxis allowDecimals={false} stroke={CHART_AXIS} fontSize={12} tickLine={false} axisLine={false} width={28} />
          <Tooltip content={ChartTooltipContent} />
          <Area
            type="monotone"
            dataKey="quantidade"
            name="Novos leads"
            stroke="#22D3EE"
            strokeWidth={2.5}
            fill="url(#novosLeadsGradient)"
            dot={{ r: 3, fill: "#22D3EE", strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltipContent } from "./chart-tooltip";
import { CHART_AXIS, CHART_CATEGORICAL, CHART_GRID } from "./chart-colors";

export function LeadsPorEstagioChart({ dados }: { dados: { nome: string; quantidade: number }[] }) {
  if (dados.every((d) => d.quantidade === 0)) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
        Nenhum lead cadastrado ainda.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(220, dados.length * 44)}>
      <BarChart data={dados} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 4 }}>
        <CartesianGrid horizontal={false} stroke={CHART_GRID} />
        <XAxis type="number" allowDecimals={false} stroke={CHART_AXIS} fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          type="category"
          dataKey="nome"
          stroke={CHART_AXIS}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          width={120}
        />
        <Tooltip content={ChartTooltipContent} cursor={{ fill: "hsl(224 14% 14%)" }} />
        <Bar dataKey="quantidade" name="Leads" radius={[0, 4, 4, 0]} maxBarSize={22}>
          {dados.map((entry, index) => (
            <Cell key={entry.nome} fill={CHART_CATEGORICAL[index % CHART_CATEGORICAL.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

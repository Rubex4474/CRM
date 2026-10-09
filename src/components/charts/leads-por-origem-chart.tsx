"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartTooltipContent } from "./chart-tooltip";
import { CHART_CATEGORICAL } from "./chart-colors";

export function LeadsPorOrigemChart({ dados }: { dados: { nome: string; quantidade: number }[] }) {
  const total = dados.reduce((soma, d) => soma + d.quantidade, 0);

  if (total === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        Nenhum lead cadastrado ainda.
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6">
      <ResponsiveContainer width={160} height={160} className="shrink-0">
        <PieChart>
          <Pie data={dados} dataKey="quantidade" nameKey="nome" innerRadius={48} outerRadius={78} paddingAngle={2}>
            {dados.map((entry, index) => (
              <Cell key={entry.nome} fill={CHART_CATEGORICAL[index % CHART_CATEGORICAL.length]} stroke="none" />
            ))}
          </Pie>
          <Tooltip content={ChartTooltipContent} />
        </PieChart>
      </ResponsiveContainer>
      <ul className="flex min-w-0 flex-1 flex-col gap-2">
        {dados.map((d, index) => (
          <li key={d.nome} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: CHART_CATEGORICAL[index % CHART_CATEGORICAL.length] }}
              />
              <span className="truncate">{d.nome}</span>
            </span>
            <span className="shrink-0 tabular-nums text-muted-foreground">
              {d.quantidade} · {Math.round((d.quantidade / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

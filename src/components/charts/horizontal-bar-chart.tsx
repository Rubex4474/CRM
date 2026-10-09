"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { makeChartTooltipContent } from "./chart-tooltip";
import { CHART_AXIS, CHART_CATEGORICAL, CHART_GRID } from "./chart-colors";

/**
 * "formato" em vez de aceitar a função formatadora direto: esse componente é
 * client, e quem chama (página do Dashboard) é server component — funções não
 * atravessam essa fronteira como prop, só valores serializáveis.
 */
export function HorizontalBarChart({
  dados,
  formato = "numero",
  vazio = "Nenhum dado ainda.",
}: {
  dados: { nome: string; valor: number }[];
  formato?: "numero" | "moeda";
  vazio?: string;
}) {
  const formatarValor = formato === "moeda" ? formatCurrency : (v: number) => String(v);
  const TooltipContent = useMemo(() => makeChartTooltipContent(formatarValor), [formato]);

  if (dados.length === 0 || dados.every((d) => d.valor === 0)) {
    return <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">{vazio}</div>;
  }

  const maiorValor = Math.max(...dados.map((d) => d.valor));

  return (
    <ResponsiveContainer width="100%" height={Math.max(180, dados.length * 48)}>
      <BarChart data={dados} layout="vertical" margin={{ top: 4, right: 48, bottom: 4, left: 4 }}>
        <CartesianGrid horizontal={false} stroke={CHART_GRID} />
        <XAxis type="number" hide domain={[0, maiorValor * 1.15 || 1]} />
        <YAxis
          type="category"
          dataKey="nome"
          stroke={CHART_AXIS}
          fontSize={12.5}
          tickLine={false}
          axisLine={false}
          width={128}
        />
        <Tooltip content={TooltipContent} cursor={{ fill: "hsl(224 14% 14%)" }} />
        <Bar dataKey="valor" name="Valor" radius={[0, 6, 6, 0]} maxBarSize={26}>
          {dados.map((entry, index) => (
            <Cell key={entry.nome} fill={CHART_CATEGORICAL[index % CHART_CATEGORICAL.length]} />
          ))}
          <LabelList
            dataKey="valor"
            position="right"
            formatter={(v: unknown) => formatarValor(Number(v))}
            className="fill-foreground text-xs font-semibold"
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

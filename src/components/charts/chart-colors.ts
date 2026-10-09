/**
 * Paleta categórica pros gráficos — deliberadamente separada do vermelho da marca
 * (--primary/--destructive), que fica reservado pra "urgente/atrasado" no resto da
 * UI. Usar vermelho aqui também misturaria o sinal de "série de dados" com o de
 * "alerta".
 */
export const CHART_CATEGORICAL = [
  "#38BDF8", // sky
  "#34D399", // emerald
  "#A78BFA", // violet
  "#FBBF24", // amber
  "#F472B6", // pink
  "#94A3B8", // slate (fallback / "outros")
];

export const CHART_GRID = "hsl(224 13% 16%)";
export const CHART_AXIS = "hsl(220 9% 56%)";

/**
 * Paleta categórica pros gráficos — deliberadamente separada do vermelho da marca
 * (--primary/--destructive), que fica reservado pra "urgente/atrasado" no resto da
 * UI. Usar vermelho aqui também misturaria o sinal de "série de dados" com o de
 * "alerta". Tons mais saturados que o resto da UI de propósito — é a parte do
 * produto que pode (e deve) ter mais vida.
 */
export const CHART_CATEGORICAL = [
  "#22D3EE", // cyan
  "#34D399", // emerald
  "#A78BFA", // violet
  "#FBBF24", // amber
  "#FB7185", // rose
  "#60A5FA", // blue
  "#94A3B8", // slate (fallback / "outros")
];

export const CHART_GRID = "hsl(224 13% 16%)";
export const CHART_AXIS = "hsl(220 9% 56%)";

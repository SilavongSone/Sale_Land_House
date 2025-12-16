
export const formatNumber = (value?: number | string | null): string => {
  if (value === null || value === undefined || value === "") return "-";
  const num = Number(value);
  if (isNaN(num)) return "-";
  return new Intl.NumberFormat("lo-LA").format(num);
};


export const formatArea = (area?: number | string | null): string => {
  return formatNumber(area);
};


export const formatUtilization = (utilization?: number | string | null): string => {
  return formatNumber(utilization) + "%";
};


export const formatCurrencyKib = (value?: number | string | null): string => {
  return formatNumber(value) + " ₭";
};
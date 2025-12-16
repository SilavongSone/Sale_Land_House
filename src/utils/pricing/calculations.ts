export const calculateHouseTotalPrice = (
  housePrice?: number | string | null,
  landPrice?: number | string | null
): number => {
  const house = Number(housePrice) || 0;
  const land = Number(landPrice) || 0;
  return house + land;
};

export const calculateLandPlotTotalPrice = (
  landArea?: number | string | null,
  pricePerSqm?: number | string | null
): number => {
  if (!landArea || !pricePerSqm) return 0;
  return Number(landArea) * Number(pricePerSqm);
};
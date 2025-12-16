// ========================================
// CALCULATION UTILITIES
// ========================================

export const calculateTotalPrice = (
  propertyType: "LAND" | "HOUSE" | "OTHER",
  landPrice: number = 0,
  housePrice: number = 0
): number => {
  if (propertyType === "LAND") return landPrice;
  if (propertyType === "HOUSE") return landPrice + housePrice;
  return 0;
};

export const calculateFinalPrice = (
  totalPrice: number = 0,
  discountAmount: number = 0
): number => {
  return Math.max(0, totalPrice - discountAmount);
};

export const calculateLoanAmount = (
  finalPrice: number = 0,
  downPayment: number = 0
): number => {
  return Math.max(0, finalPrice - downPayment);
};

export const calculateMonthlyPayment = (
  loanAmount: number = 0,
  installmentMonths: number = 0,
  interestRate: number = 0
): number => {
  if (installmentMonths === 0 || loanAmount === 0) return 0;

  if (interestRate === 0) {
    return loanAmount / installmentMonths;
  }

  const monthlyRate = interestRate / 100 / 12;
  const power = Math.pow(1 + monthlyRate, installmentMonths);
  const numerator = loanAmount * monthlyRate * power;
  const denominator = power - 1;

  return numerator / denominator;
};

export const calculateSaleData = (saleData: {
  propertyType: "LAND" | "HOUSE" | "OTHER";
  landPrice?: number;
  housePrice?: number;
  discountAmount?: number;
  downPayment?: number;
  installmentMonths?: number;
  interestRate?: number;
}) => {
  const totalPrice = calculateTotalPrice(
    saleData.propertyType,
    saleData.landPrice,
    saleData.housePrice
  );
  const finalPrice = calculateFinalPrice(totalPrice, saleData.discountAmount);
  const loanAmount = calculateLoanAmount(finalPrice, saleData.downPayment);
  const monthlyPayment = calculateMonthlyPayment(
    loanAmount,
    saleData.installmentMonths,
    saleData.interestRate
  );

  return {
    totalPrice,
    finalPrice,
    loanAmount,
    monthlyPayment,
    remainingBalance: loanAmount,
  };
};

// ========================================
// VALIDATION UTILITIES
// ========================================

export const validateSale = (data: {
  selectedCustomer: any;
  selectedSeller: any;
  selectedZone: any;
  currentSale: any;
}): string[] => {
  const errors: string[] = [];

  if (!data.selectedCustomer) {
    errors.push("ກະລຸນາເລືອກລູກຄ້າ");
  }

  if (!data.selectedSeller) {
    errors.push("ກະລຸນາເລືອກພະນັກງານຂາຍ");
  }

  if (!data.selectedZone) {
    errors.push("ກະລຸນາເລືອກໂຊນ");
  }

  if (!data.currentSale.landPlotId && !data.currentSale.houseId) {
    errors.push("ກະລຸນາເລືອກທີ່ດິນ ຫຼື ບ້ານ");
  }

  if (!data.currentSale.currencyId) {
    errors.push("ກະລຸນາເລືອກສະກຸນເງິນ");
  }

  if ((data.currentSale.totalPrice || 0) <= 0) {
    errors.push("ລາຄາລວມຕ້ອງຫຼາຍກວ່າ 0");
  }

  return errors;
};

// ========================================
// FORMATTING UTILITIES
// ========================================

export const formatCurrency = (
  amount: number,
  symbol: string = "₭"
): string => {
  return `${amount.toLocaleString()} ${symbol}`;
};

export const formatLandArea = (area: number): string => {
  return `${area} ຕ.ມ.`;
};

// ========================================
// API HELPER UTILITIES
// ========================================

export const getApiMethod = (
  obj: any,
  methodNames: string[]
): Function | null => {
  for (const name of methodNames) {
    if (typeof obj[name] === "function") {
      return obj[name];
    }
  }
  return null;
};

export const normalizeDateFields = (data: any) => {
  return {
    ...data,
    saleDate:
      data.saleDate instanceof Date
        ? data.saleDate.toISOString()
        : data.saleDate,
    contractDate:
      data.contractDate instanceof Date
        ? data.contractDate.toISOString()
        : data.contractDate,
    createdAt:
      data.createdAt instanceof Date
        ? data.createdAt.toISOString()
        : data.createdAt,
    updatedAt:
      data.updatedAt instanceof Date
        ? data.updatedAt.toISOString()
        : data.updatedAt,
  };
};

export const parseDateFields = (data: any) => {
  return {
    ...data,
    saleDate: data.saleDate ? new Date(data.saleDate) : new Date(),
    contractDate:
      typeof data.contractDate === "string"
        ? new Date(data.contractDate)
        : data.contractDate,
    createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
    updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
  };
};
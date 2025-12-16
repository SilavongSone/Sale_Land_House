import { useCallback } from "react";
import { useSaleStore } from "../store/saleStore";

// ========================================
// MAIN SALE HOOK
// ========================================

export const useSale = () => {
  const store = useSaleStore();

  const handleSubmitSale = useCallback(async () => {
    const errors = store.validateSale();
    if (errors.length > 0) {
      return { success: false, errors };
    }

    const saleData = {
      ...store.currentSale,
      saleDate: new Date(),
    };

    const result = await store.createSale(saleData);
    return { success: !!result, sale: result };
  }, [store]);

  return {
    ...store,
    handleSubmitSale,
  };
};

// ========================================
// SELECTION HOOKS
// ========================================

export const useSaleSelection = () => {
  const {
    selectedProject,
    selectedZone,
    selectedLandPlot,
    selectedHouse,  // ✅ เพิ่มบรรทัดนี้
    selectedCustomer,
    selectedSeller,
    selectedCurrency,
    setProject,
    setZone,
    setLandPlot,
    setHouse,  // ✅ เพิ่มบรรทัดนี้
    setCustomer,
    setSeller,
    setCurrency,
  } = useSaleStore();

  return {
    selectedProject,
    selectedZone,
    selectedLandPlot,
    selectedHouse,  // ✅ เพิ่มบรรทัดนี้
    selectedCustomer,
    selectedSeller,
    selectedCurrency,
    setProject,
    setZone,
    setLandPlot,
    setHouse,  // ✅ เพิ่มบรรทัดนี้
    setCustomer,
    setSeller,
    setCurrency,
  };
};

// ========================================
// CUSTOM LAND HOOK
// ========================================

export const useCustomLand = () => {
  const store = useSaleStore() as any;

  const {
    customLandInput,
    updateCustomLandInput,
    createCustomLandPlot,
    loading,
    error,
  } = store;

  const handleCreateCustomLand = useCallback(async () => {
    const result = await store.createCustomLandPlot();
    return { success: !!result, landPlot: result };
  }, [store]);

  return {
    customLandInput,
    updateCustomLandInput,
    handleCreateCustomLand,
    loading,
    error,
  };
};

// ========================================
// PAYMENT HOOK
// ========================================

export const useSalePayment = () => {
  const {
    currentSale,
    calculatedData,
    setDownPayment,
    setInstallmentMonths,
    setInterestRate,
    setDiscountAmount,
    setNotes,
  } = useSaleStore();

  return {
    downPayment: currentSale.downPayment,
    installmentMonths: currentSale.installmentMonths,
    interestRate: currentSale.interestRate,
    discountAmount: currentSale.discountAmount,
    notes: currentSale.notes,
    calculatedData,
    setDownPayment,
    setInstallmentMonths,
    setInterestRate,
    setDiscountAmount,
    setNotes,
  };
};

// ========================================
// PROPERTY TYPE HOOK
// ========================================

export const usePropertyType = () => {
  const { propertyType, setPropertyType } = useSaleStore();

  return {
    propertyType,
    setPropertyType,
  };
};
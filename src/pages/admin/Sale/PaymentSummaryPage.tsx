// Constants
import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Modal,
  Button,
  Notification,
  useToaster,
  InputNumber,
  Input,
  SelectPicker,
  Loader,
} from "rsuite";
import {
  CheckCircle2,
  CreditCard,
  AlertCircle,
  User,
  Users,
  MapPin,
  Home,
} from "lucide-react";
import { useSaleStore } from "../../../store/saleStore";
import useCurrencyStore from "../../../store/currencyStore";
import { useCustomerStore } from "../../../store/customerStore";
import { useStaffStore } from "../../../store/staffStore";
import { useAuthStore } from "../../../store/authStore";
import { paymentAPI } from "../../../api/payment";

// Proper TypeScript interfaces
interface PropertyData {
  propertyType: "LAND" | "HOUSE";
  propertyId: number;
  zoneId: number;
  price: number;
  totalPrice?: number;
  plotNumber?: string;
  houseNumber?: string;
  zoneName?: string;
  zone?: {
    zoneId: number;
    zoneName: string;
  };
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProperty: PropertyData | null;
  onSuccess?: () => void;
}

const useNotification = () => {
  const toaster = useToaster();
  return useCallback(
    (type: "success" | "error" | "warning", message: string) => {
      toaster.push(
        <Notification
          type={type}
          header={type === "success" ? "ສຳເລັດ" : "ແຈ້ງເຕືອນ"}
          closable
        >
          {message}
        </Notification>,
        { placement: "topEnd", duration: 3000 }
      );
    },
    [toaster]
  );
};

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  selectedProperty,
  onSuccess,
}) => {
  const { createSale, calculateTotals, loading } = useSaleStore();
  const { currencies, fetchCurrencies } = useCurrencyStore();
  const { customers, fetchCustomers } = useCustomerStore();
  const { staffs, fetchStaffs } = useStaffStore();
  const { currentUser } = useAuthStore();
  const showNotification = useNotification();

  const [confirming, setConfirming] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState<number | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<number | null>(null);
  const [downPayment, setDownPayment] = useState<number>(0);
  const [installmentMonths, setInstallmentMonths] = useState<number>(0);
  const [interestRate, setInterestRate] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");

  // Load initial data
  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        setDataLoading(true);
        try {
          await Promise.all([
            currencies.length === 0 ? fetchCurrencies() : Promise.resolve(),
            customers.length === 0 ? fetchCustomers() : Promise.resolve(),
            staffs.length === 0 ? fetchStaffs() : Promise.resolve(),
          ]);
        } catch (error) {
          showNotification("error", "ໂຫຼດຂໍ້ມູນບໍ່ສຳເລັດ");
        } finally {
          setDataLoading(false);
        }
      };
      loadData();
    }
  }, [isOpen]);

  // Set default currency (LAK)
  useEffect(() => {
    if (currencies.length > 0 && selectedCurrency === null && isOpen) {
      const defaultCurrency =
        currencies.find((c) => c.symbol === "LAK" || c.symbol === "₭") ||
        currencies.find((c) => c.isDefault === true) ||
        currencies[0];

      if (defaultCurrency) {
        setSelectedCurrency(Number(defaultCurrency.currencyId));
      }
    }
  }, [currencies, selectedCurrency, isOpen]);

  const propertyPrice = useMemo(() => {
    if (!selectedProperty) return 0;
    return selectedProperty.totalPrice || selectedProperty.price || 0;
  }, [selectedProperty]);

  const isLandProperty = selectedProperty?.propertyType === "LAND";

  const selectedCurrencyData = useMemo(() => {
    if (!selectedCurrency || currencies.length === 0) return null;
    return currencies.find(
      (c) => Number(c.currencyId) === Number(selectedCurrency)
    );
  }, [currencies, selectedCurrency]);

  const exchangeRate = selectedCurrencyData?.exchangeRate || 1;
  const currencySymbol = selectedCurrencyData?.symbol || "₭";

  const { totalPrice: priceAfterDiscount, monthlyPayment } = useMemo(
    () =>
      calculateTotals(
        propertyPrice,
        discountAmount,
        downPayment,
        installmentMonths,
        interestRate
      ),
    [
      propertyPrice,
      discountAmount,
      downPayment,
      installmentMonths,
      interestRate,
      calculateTotals,
    ]
  );

  const remainingBalance = priceAfterDiscount - downPayment;

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedStaff(null);
      setSelectedCustomer(null);
      setSelectedCurrency(null);
      setDownPayment(0);
      setInstallmentMonths(0);
      setInterestRate(0);
      setDiscountAmount(0);
      setNotes("");
      setDataLoading(true);
    }
  }, [isOpen]);

  // Memoized options
  const staffOptions = useMemo(
    () =>
      staffs.map((s) => ({
        value: Number(s.staffId),
        label: `${s.firstName} ${s.lastName || ""} - ${s.position}`,
      })),
    [staffs]
  );

  const customerOptions = useMemo(
    () =>
      customers.map((c) => ({
        value: Number(c.customerId),
        label: `${c.firstName} ${c.lastName || ""} - ${c.phone || ""}`,
      })),
    [customers]
  );

  const currencyOptions = useMemo(
    () =>
      currencies.map((c) => ({
        value: Number(c.currencyId),
        label: `${c.symbol} (${c.currencyName})`,
      })),
    [currencies]
  );

  // Property display info
  const propertyInfo = useMemo(() => {
    if (!selectedProperty) return null;

    const propertyNumber = isLandProperty
      ? selectedProperty.plotNumber || selectedProperty.propertyId
      : selectedProperty.houseNumber || selectedProperty.propertyId;

    const zoneName =
      selectedProperty.zone?.zoneName ||
      selectedProperty.zoneName ||
      `Zone ${selectedProperty.zoneId}`;

    return {
      number: propertyNumber,
      zoneName,
    };
  }, [selectedProperty, isLandProperty]);

  // Get projectId for payment (if needed from sale data)

  // Validation before submit
  const validateForm = useCallback(() => {
    if (!selectedStaff) {
      showNotification("warning", "ກະລຸນາເລືອກພະນັກງານ");
      return false;
    }
    if (!selectedCustomer) {
      showNotification("warning", "ກະລຸນາເລືອກລູກຄ້າ");
      return false;
    }
    if (!selectedProperty) {
      showNotification("warning", "ກະລຸນາເລືອກຊັບສິນ");
      return false;
    }
    if (!selectedCurrency) {
      showNotification("warning", "ກະລຸນາເລືອກສະກຸນເງິນ");
      return false;
    }
    if (downPayment > priceAfterDiscount) {
      showNotification("warning", "ເງິນດາວເກີນລາຄາສຸດທິ");
      return false;
    }
    if (installmentMonths > 0 && interestRate === 0) {
      showNotification("warning", "ກະລຸນາກຳນົດອັດຕາດອກເບ້ຍສຳລັບການຜ່ອນຊຳລະ");
      return false;
    }
    return true;
  }, [
    selectedStaff,
    selectedCustomer,
    selectedProperty,
    selectedCurrency,
    downPayment,
    priceAfterDiscount,
    installmentMonths,
    interestRate,
    showNotification,
  ]);

  const handleConfirmPayment = useCallback(async () => {
    if (!validateForm()) return;

    setConfirming(true);

    try {
      const saleData = {
        propertyType: selectedProperty!.propertyType,
        zoneId: Number(selectedProperty!.zoneId),
        landPlotId:
          selectedProperty!.propertyType === "LAND"
            ? Number(selectedProperty!.propertyId)
            : null,
        houseId:
          selectedProperty!.propertyType === "HOUSE"
            ? Number(selectedProperty!.propertyId)
            : null,
        customerId: Number(selectedCustomer!),
        sellerId: Number(selectedStaff!),
        price: propertyPrice,
        totalPrice: priceAfterDiscount,
        discountAmount: discountAmount,
        downPayment: downPayment,
        installmentMonths: installmentMonths,
        monthlyPayment: monthlyPayment,
        interestRate: interestRate,
        currencyId: Number(selectedCurrency!),
        exchangeRate: exchangeRate,
        saleStatus: "CONFIRMED" as const,
        paymentStatus:
          downPayment >= priceAfterDiscount
            ? "PAID"
            : ("PENDING" as "PAID" | "PENDING" | "OVERDUE"),
        notes: notes,
      };

      const createdSale = await createSale(saleData);

      if (!createdSale?.id) {
        throw new Error("ບໍ່ສາມາດສ້າງຂໍ້ມູນການຂາຍໄດ້");
      }

      // Create payment record if there's a down payment
      if (downPayment > 0) {
        if (!currentUser?.id) {
          showNotification(
            "error",
            "ບໍ່ພົບຂໍ້ມູນຜູ້ໃຊ້ ກະລຸນາເຂົ້າສູ່ລະບົບໃໝ່"
          );
          setConfirming(false);
          return;
        }

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");

        const paymentData = {
          saleId: Number(createdSale.id),
          projectId: "", // Empty string instead of null (adjust if you need actual projectId)
          billNumber: `BILL-${createdSale.id}-${Date.now()}`,
          amount: downPayment,
          date: `${year}-${month}-${day}`,
          month: `${year}-${month}`,
          method: "CASH",
          currencyId: Number(selectedCurrency!),
          exchangeRate: exchangeRate,
          type: 1,
          description: `ເງິນດາວ${notes ? ` - ${notes}` : ""}`,
          fileDoc: null,
          createdById: Number(currentUser.id),
          status: 1,
          balanceAfter: priceAfterDiscount - downPayment,
        };

        try {
          await paymentAPI.create(paymentData);
          showNotification("success", "ບັນທຶກການຂາຍແລະການຊຳລະເງິນສຳເລັດ!");
        } catch (paymentError: any) {
          showNotification(
            "warning",
            `ບັນທຶກການຂາຍສຳເລັດ (ລະຫັດການຂາຍ: ${createdSale.id}) ແຕ່ການບັນທຶກການຊຳລະເງິນມີບັນຫາ`
          );
        }
      } else {
        showNotification("success", "ບັນທຶກການຂາຍສຳເລັດ!");
      }

      onSuccess?.();
      onClose();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "ບັນທຶກຂໍ້ມູນບໍ່ສຳເລັດ";
      showNotification("error", errorMessage);
    } finally {
      setConfirming(false);
    }
  }, [
    validateForm,
    selectedProperty,
    selectedStaff,
    selectedCustomer,
    selectedCurrency,
    propertyPrice,
    priceAfterDiscount,
    discountAmount,
    downPayment,
    installmentMonths,
    monthlyPayment,
    interestRate,
    exchangeRate,
    notes,
    currentUser,
    createSale,
    showNotification,
    onSuccess,
    onClose,
  ]);

  // Handle close with cleanup
  const handleClose = useCallback(() => {
    if (confirming) return;
    onClose();
  }, [confirming, onClose]);

  if (!selectedProperty) {
    return (
      <Modal open={isOpen} onClose={handleClose} size="xs">
        <Modal.Body>
          <div className="text-center py-8">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">ບໍ່ມີຂໍ້ມູນຊັບສິນ</p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleClose} appearance="primary">
            ປິດ
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  return (
    <Modal open={isOpen} onClose={handleClose} size="md" overflow>
      <Modal.Header>
        <Modal.Title>
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <span className="font-bold text-gray-800">ບັນທຶກການຊຳລະເງິນ</span>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {dataLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader size="md" content="ກຳລັງໂຫຼດຂໍ້ມູນ..." />
          </div>
        ) : (
          <div className="space-y-4">
            {/* ຂໍ້ມູນຊັບສິນ */}
            <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-lg ${
                    isLandProperty ? "bg-green-100" : "bg-blue-100"
                  }`}
                >
                  {isLandProperty ? (
                    <MapPin className="w-5 h-5 text-green-600" />
                  ) : (
                    <Home className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">
                    {isLandProperty
                      ? `ແປງດິນ #${propertyInfo?.number}`
                      : `ເຮືອນ #${propertyInfo?.number}`}
                  </h3>
                  <p className="text-sm text-gray-600">
                    ໂຊນ: {propertyInfo?.zoneName}
                  </p>
                </div>
              </div>
            </div>

            {/* ເລືອກພະນັກງານ ແລະ ລູກຄ້າ */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-1 text-sm font-medium mb-2 text-gray-700">
                  <Users className="w-4 h-4 text-blue-600" />
                  ພະນັກງານ <span className="text-red-500">*</span>
                </label>
                <SelectPicker
                  data={staffOptions}
                  value={selectedStaff}
                  onChange={setSelectedStaff}
                  placeholder="ເລືອກພະນັກງານ"
                  style={{ width: "100%" }}
                  searchable
                  size="sm"
                  disabled={staffs.length === 0}
                />
              </div>

              <div>
                <label className="flex items-center gap-1 text-sm font-medium mb-2 text-gray-700">
                  <User className="w-4 h-4 text-green-600" />
                  ລູກຄ້າ <span className="text-red-500">*</span>
                </label>
                <SelectPicker
                  data={customerOptions}
                  value={selectedCustomer}
                  onChange={setSelectedCustomer}
                  placeholder="ເລືອກລູກຄ້າ"
                  style={{ width: "100%" }}
                  searchable
                  size="sm"
                  disabled={customers.length === 0}
                />
              </div>
            </div>

            {/* ລາຄາ */}
            <div className="bg-blue-50 rounded-lg p-3 space-y-2 border border-blue-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">ລາຄາເດີມ:</span>
                <span className="font-semibold text-gray-800">
                  {propertyPrice.toLocaleString()} {currencySymbol}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">ສ່ວນຫຼຸດ:</span>
                <InputNumber
                  value={discountAmount}
                  onChange={(v) => setDiscountAmount(Number(v) || 0)}
                  min={0}
                  max={propertyPrice}
                  style={{ width: 130 }}
                  size="sm"
                  postfix={currencySymbol}
                />
              </div>
              <div className="flex justify-between pt-2 border-t border-blue-300">
                <span className="font-semibold text-gray-800">ລາຄາສຸດທິ:</span>
                <span className="text-lg font-bold text-blue-600">
                  {priceAfterDiscount.toLocaleString()} {currencySymbol}
                </span>
              </div>
            </div>

            {/* ສະກຸນເງິນ */}
            <div>
              <label className="text-sm font-medium mb-2 block text-gray-700">
                ສະກຸນເງິນ <span className="text-red-500">*</span>
              </label>
              <SelectPicker
                data={currencyOptions}
                value={selectedCurrency}
                onChange={setSelectedCurrency}
                style={{ width: "100%" }}
                searchable={false}
                size="sm"
                placeholder={
                  currencies.length === 0 ? "ກຳລັງໂຫຼດ..." : "ເລືອກສະກຸນເງິນ"
                }
                disabled={currencies.length === 0}
              />
              {selectedCurrencyData &&
                selectedCurrencyData.symbol !== "LAK" &&
                selectedCurrencyData.symbol !== "₭" && (
                  <p className="text-xs text-gray-500 mt-1">
                    ອັດຕາແລກປ່ຽນ: 1 {selectedCurrencyData.symbol} ={" "}
                    {exchangeRate.toLocaleString()} ₭
                  </p>
                )}
            </div>

            {/* ຂໍ້ມູນການຜ່ອນຊຳລະ */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">
                  ເງິນດາວ
                </label>
                <InputNumber
                  value={downPayment}
                  onChange={(v) => {
                    const value = Number(v) || 0;
                    setDownPayment(Math.min(value, priceAfterDiscount));
                  }}
                  min={0}
                  max={priceAfterDiscount}
                  style={{ width: "100%" }}
                  size="sm"
                  postfix={currencySymbol}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">
                  ຈຳນວນງວດ
                </label>
                <InputNumber
                  value={installmentMonths}
                  onChange={(v) => setInstallmentMonths(Number(v) || 0)}
                  min={0}
                  max={360}
                  style={{ width: "100%" }}
                  size="sm"
                  postfix="ເດືອນ"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">
                  ດອກເບ້ຍ
                </label>
                <InputNumber
                  value={interestRate}
                  onChange={(v) => setInterestRate(Number(v) || 0)}
                  min={0}
                  max={100}
                  step={0.5}
                  style={{ width: "100%" }}
                  size="sm"
                  postfix="%"
                />
              </div>
            </div>

            {/* ສະຫຼຸບການຜ່ອນຊຳລະ */}
            {installmentMonths > 0 && (
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">ຍອດຄົງເຫຼືອ:</p>
                    <p className="font-bold text-gray-800">
                      {remainingBalance.toLocaleString()} {currencySymbol}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">ຊຳລະຕໍ່ເດືອນ:</p>
                    <p className="font-bold text-green-600">
                      {monthlyPayment.toLocaleString()} {currencySymbol}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ໝາຍເຫດ */}
            <div>
              <label className="text-sm font-medium mb-2 block text-gray-700">
                ໝາຍເຫດ
              </label>
              <Input
                as="textarea"
                rows={2}
                value={notes}
                onChange={setNotes}
                placeholder="ລາຍລະອຽດເພີ່ມເຕີມ..."
                size="sm"
              />
            </div>

            {/* ຄຳເຕືອນ */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-800">
                ກະລຸນາກວດສອບຂໍ້ມູນທັງໝົດໃຫ້ຖືກຕ້ອງກ່ອນກົດຢືນຢັນ
              </p>
            </div>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button onClick={handleClose} appearance="subtle" disabled={confirming}>
          ຍົກເລີກ
        </Button>
        <Button
          onClick={handleConfirmPayment}
          appearance="primary"
          color="green"
          disabled={confirming || loading || dataLoading}
          loading={confirming}
        >
          {confirming ? (
            "ກຳລັງດຳເນີນການ..."
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 inline mr-1" />
              ຢືນຢັນການຊື້
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PaymentModal;

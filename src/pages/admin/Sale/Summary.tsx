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
  Divider,
  Row,
  Col,
} from "rsuite";
import {
  CheckCircle2,
  CreditCard,
  AlertCircle,
  User,
  Users,
  MapPin,
  Home,
  Tag,
  Calendar,
  TrendingUp,
  ArrowRightLeft,
  Plus
} from "lucide-react";
import { useSaleStore } from "../../../store/saleStore";
import useCurrencyStore from "../../../store/currencyStore";
import { useCustomerStore } from "../../../store/customerStore";
import { useStaffStore } from "../../../store/staffStore";
import { CustomerForm } from "../CustomersManage/CustomerForm"

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

interface SummaryProps {
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

const Summary: React.FC<SummaryProps> = ({
  isOpen,
  onClose,
  selectedProperty,
  onSuccess,
}) => {
  const { createSale, calculateTotals, loading } = useSaleStore();
  const { currencies, fetchCurrencies } = useCurrencyStore();
  const { customers, fetchCustomers } = useCustomerStore();
  const { staffs, fetchStaffs } = useStaffStore();
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

  // Property price in LAK (base currency)
  const propertyPriceInLAK = useMemo(() => {
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
  const isLAK = currencySymbol === "LAK" || currencySymbol === "₭";

  // Calculate prices in LAK first
  const priceAfterDiscountInLAK = propertyPriceInLAK - discountAmount;

  // Convert to selected currency
  const propertyPriceInSelectedCurrency = propertyPriceInLAK / exchangeRate;
  const discountInSelectedCurrency = discountAmount / exchangeRate;
  const priceAfterDiscountInSelectedCurrency =
    priceAfterDiscountInLAK / exchangeRate;

  // Calculate installment in selected currency
  const { monthlyPayment } = useMemo(
    () =>
      calculateTotals(
        priceAfterDiscountInSelectedCurrency,
        0, // discount already applied
        downPayment,
        installmentMonths,
        interestRate
      ),
    [
      priceAfterDiscountInSelectedCurrency,
      downPayment,
      installmentMonths,
      interestRate,
      calculateTotals,
    ]
  );

  const remainingBalance = priceAfterDiscountInSelectedCurrency - downPayment;

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
    if (downPayment > priceAfterDiscountInSelectedCurrency) {
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
    priceAfterDiscountInSelectedCurrency,
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
        price: propertyPriceInLAK, // Save original price in LAK
        totalPrice: priceAfterDiscountInLAK, // Save total in LAK
        discountAmount: discountAmount, // Save discount in LAK
        downPayment: downPayment * exchangeRate, // Convert to LAK
        installmentMonths: installmentMonths,
        monthlyPayment: monthlyPayment * exchangeRate, // Convert to LAK
        interestRate: interestRate,
        currencyId: Number(selectedCurrency!),
        exchangeRate: exchangeRate,
        saleStatus: "CONFIRMED" as const,
        paymentStatus:
          downPayment >= priceAfterDiscountInSelectedCurrency
            ? "PAID"
            : ("PENDING" as "PAID" | "PENDING" | "OVERDUE"),
        notes: notes,
      };

      const createdSale = await createSale(saleData);

      if (!createdSale?.id) {
        throw new Error("ບໍ່ສາມາດສ້າງຂໍ້ມູນການຂາຍໄດ້");
      }

      showNotification("success", "ບັນທຶກການຂາຍສຳເລັດ!");
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
    propertyPriceInLAK,
    priceAfterDiscountInLAK,
    discountAmount,
    downPayment,
    installmentMonths,
    monthlyPayment,
    interestRate,
    exchangeRate,
    notes,
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
      <Modal open={isOpen} onClose={handleClose} size="lg">
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
          <div className="flex items-center gap-3">
            <div className="bg-gray-700 p-2 rounded-lg">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-semibold text-gray-900">ບັນທຶກການຂາຍ</span>
              <p className="text-xs text-gray-500 font-normal mt-0.5">
                ກະລຸນາຕື່ມຂໍ້ມູນໃຫ້ຄົບຖ້ວນ
              </p>
            </div>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {dataLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <Loader size="md" />
              <p className="text-gray-500 mt-3 text-sm">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Property Information Card */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-gray-100">
                  {isLandProperty ? (
                    <MapPin className="w-5 h-5 text-gray-700" />
                  ) : (
                    <Home className="w-5 h-5 text-gray-700" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">
                    {isLandProperty
                      ? `ແປງດິນ #${propertyInfo?.number}`
                      : `ເຮືອນ #${propertyInfo?.number}`}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      ໂຊນ: {propertyInfo?.zoneName}
                    </p>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700">
                    <Tag className="w-3 h-3" />
                    ລາຄາ: {propertyPriceInLAK.toLocaleString()} ₭
                  </div>
                </div>
              </div>
            </div>

            <Divider style={{ margin: "16px 0" }}>ຂໍ້ມູນຜູ້ຊື້-ຜູ້ຂາຍ</Divider>

            {/* Staff & Customer Selection */}
            <Row>
              <Col className="mb-2" xs={24} sm={12} md={12} lg={12}>
                <label className="flex items-center gap-2 text-sm font-medium mb-2 text-gray-700">
                  <Users className="w-4 h-4 text-gray-500" />
                  ພະນັກງານຂາຍ <span className="text-red-500">*</span>
                </label>
                <SelectPicker
                  data={staffOptions}
                  value={selectedStaff}
                  onChange={setSelectedStaff}
                  placeholder="ເລືອກພະນັກງານ"
                  block
                  searchable
                  size="md"
                  disabled={staffs.length === 0}
                  placement="auto"
                />
              </Col>

              <Col xs={18} sm={12} md={12} lg={12}>
                <label className="flex items-center gap-2 text-sm font-medium mb-2 text-gray-700">
                  <User className="w-4 h-4 text-gray-500" />
                  ລູກຄ້າ <span className="text-red-500">*</span>
                </label>
                <SelectPicker
                  data={customerOptions}
                  value={selectedCustomer}
                  onChange={setSelectedCustomer}
                  placeholder="ເລືອກລູກຄ້າ"
                  block
                  searchable
                  size="md"
                  disabled={customers.length === 0}
                  placement="auto"
                />
              </Col>
              <Col xs={6} sm={12} md={12} lg={12}>
                <label className="flex items-center gap-2 text-sm font-medium mb-2 text-gray-700">
                  <User className="w-4 h-4 text-gray-500" />
                  ລູກຄ້າໃໝ່ <span className="text-red-500">*</span>
                </label>
                <Button className="bg-blue-600! hover:bg-blue-00! " block ><Plus className="w-4 h-4"><CustomerForm /></Plus></Button>
              </Col>
            </Row>

            {/* Currency Selection */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2 text-gray-700">
                <CreditCard className="w-4 h-4 text-gray-500" />
                ສະກຸນເງິນທີ່ຊຳລະ <span className="text-red-500">*</span>
              </label>
              <SelectPicker
                data={currencyOptions}
                value={selectedCurrency}
                onChange={(value) => {
                  setSelectedCurrency(value);
                  // Reset payment values when currency changes
                  setDownPayment(0);
                  setDiscountAmount(0);
                }}
                block
                searchable={false}
                size="md"
                placeholder={
                  currencies.length === 0 ? "ກຳລັງໂຫຼດ..." : "ເລືອກສະກຸນເງິນ"
                }
                disabled={currencies.length === 0}
                placement="auto"
              />
              {selectedCurrencyData && !isLAK && (
                <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                  <p className="text-xs text-blue-700 flex items-center gap-1.5">
                    <ArrowRightLeft className="w-3 h-3" />
                    ອັດຕາແລກປ່ຽນ: 1 {selectedCurrencyData.symbol} ={" "}
                    {exchangeRate.toLocaleString()} ₭
                  </p>
                </div>
              )}
            </div>

            <Divider style={{ margin: "16px 0" }}>ລາຄາ ແລະ ສ່ວນຫຼຸດ</Divider>

            {/* Price Section */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="space-y-3">
                {/* Original Price in LAK */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">ລາຄາເດີມ (₭):</span>
                  <span className="font-semibold text-gray-900">
                    {propertyPriceInLAK.toLocaleString()} ₭
                  </span>
                </div>

                {/* Show converted price if not LAK */}
                {!isLAK && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">
                      ແປງເປັນ ({currencySymbol}):
                    </span>
                    <span className="font-medium text-gray-700">
                      ≈{" "}
                      {propertyPriceInSelectedCurrency.toLocaleString(
                        undefined,
                        { maximumFractionDigits: 2 }
                      )}{" "}
                      {currencySymbol}
                    </span>
                  </div>
                )}

                {/* Discount input in LAK */}
                <div className="flex justify-between items-center bg-white rounded-lg p-2.5 border border-gray-200">
                  <span className="text-sm font-medium text-gray-700">
                    ສ່ວນຫຼຸດ (₭):
                  </span>
                  <InputNumber
                    value={discountAmount}
                    onChange={(v) => setDiscountAmount(Number(v) || 0)}
                    min={0}
                    max={propertyPriceInLAK}
                    style={{ width: 160 }}
                    size="md"
                    postfix="₭"
                  />
                </div>

                {/* Show discount in selected currency if not LAK */}
                {!isLAK && discountAmount > 0 && (
                  <div className="flex justify-between items-center text-sm pl-2">
                    <span className="text-gray-500">
                      ສ່ວນຫຼຸດ ({currencySymbol}):
                    </span>
                    <span className="font-medium text-gray-700">
                      ≈{" "}
                      {discountInSelectedCurrency.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}{" "}
                      {currencySymbol}
                    </span>
                  </div>
                )}

                <div className="border-t border-gray-200 my-2"></div>

                {/* Net Price in LAK */}
                <div className="flex justify-between items-center pt-1">
                  <span className="font-semibold text-gray-900">
                    ລາຄາສຸດທິ (₭):
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    {priceAfterDiscountInLAK.toLocaleString()} ₭
                  </span>
                </div>

                {/* Net Price in selected currency if not LAK */}
                {!isLAK && (
                  <div className="flex justify-between items-center bg-blue-50 rounded-lg p-2 border border-blue-200">
                    <span className="font-semibold text-blue-900">
                      ຈ່າຍດ້ວຍ ({currencySymbol}):
                    </span>
                    <span className="text-xl font-bold text-blue-900">
                      {priceAfterDiscountInSelectedCurrency.toLocaleString(
                        undefined,
                        { maximumFractionDigits: 2 }
                      )}{" "}
                      {currencySymbol}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Divider style={{ margin: "16px 0" }}>ການຜ່ອນຊຳລະ</Divider>

            {/* Payment Terms */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">
                  ເງິນດາວ ({currencySymbol})
                </label>
                <InputNumber
                  value={downPayment}
                  onChange={(v) => {
                    const value = Number(v) || 0;
                    setDownPayment(
                      Math.min(value, priceAfterDiscountInSelectedCurrency)
                    );
                  }}
                  min={0}
                  max={priceAfterDiscountInSelectedCurrency}
                  block
                  size="md"
                  postfix={currencySymbol}
                  step={isLAK ? 10000 : 10}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                  ຈຳນວນງວດ
                </label>
                <InputNumber
                  value={installmentMonths}
                  onChange={(v) => setInstallmentMonths(Number(v) || 0)}
                  min={0}
                  max={360}
                  block
                  size="md"
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
                  block
                  size="md"
                  postfix="%"
                />
              </div>
            </div>

            {/* Installment Summary */}
            {installmentMonths > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  ສະຫຼຸບການຜ່ອນຊຳລະ ({currencySymbol})
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">ຍອດຄົງເຫຼືອ</p>
                    <p className="font-semibold text-gray-900">
                      {remainingBalance.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {currencySymbol}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">ຊຳລະຕໍ່ເດືອນ</p>
                    <p className="font-semibold text-gray-900">
                      {monthlyPayment.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {currencySymbol}
                    </p>
                  </div>
                </div>
                {!isLAK && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      * ຍອດເງິນໃນລະບົບຈະຖືກບັນທຶກເປັນເງິນກີບ (₭) ຕາມອັດຕາແລກປ່ຽນ
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="text-sm font-medium mb-2 block text-gray-700">
                ໝາຍເຫດ
              </label>
              <Input
                as="textarea"
                rows={3}
                value={notes}
                onChange={setNotes}
                placeholder="ລາຍລະອຽດເພີ່ມເຕີມ (ຖ້າມີ)..."
                size="md"
              />
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  ກະລຸນາກວດສອບຂໍ້ມູນ
                </p>
                <p className="text-xs text-gray-600">
                  ກວດສອບຂໍ້ມູນທັງໝົດໃຫ້ຖືກຕ້ອງກ່ອນກົດຢືນຢັນ
                  ເນື່ອງຈາກຂໍ້ມູນຈະຖືກບັນທຶກເຂົ້າລະບົບທັນທີ
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <div className="flex gap-2 w-full justify-end">
          <Button
            onClick={handleClose}
            appearance="ghost"
            disabled={confirming}
            size="lg"
          >
            ຍົກເລີກ
          </Button>
          <Button
            onClick={handleConfirmPayment}
            appearance="primary"
            disabled={confirming || loading || dataLoading}
            loading={confirming}
            size="lg"
            style={{
              backgroundColor: confirming ? undefined : "#1f2937",
              border: "none",
            }}
          >
            {confirming ? (
              "ກຳລັງບັນທຶກ..."
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                ຢືນຢັນການຂາຍ
              </span>
            )}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default Summary;

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import {
  Modal,
  Form,
  Button,
  Schema,
  SelectPicker,
  InputNumber,
  Message,
  toaster,
  Loader,
  Input,
  Grid,
  Row,
  Col,
} from "rsuite";
import { BarChart2, CheckCircle, Circle } from "lucide-react";
import { useHouseStore } from "../../../store/houseStore";
import { useAreaStore } from "../../../store/areaStore";
import { formatArea, formatCurrencyKib } from "../../../utils/formatters/formatn-number";
import type { House, HouseCreateInput, FormValue } from "../../../types/house";
import type { Project } from "../../../types/project";

const { StringType, NumberType } = Schema.Types;

interface HouseFormProps {
  open: boolean;
  onClose: () => void;
  house: House | null;
  projects: Project[];
}

// Constants
const INITIAL_FORM_VALUE: FormValue = {
  projectId: null,
  zoneId: null,
  houseNumber: "",
  houseType: "SINGLE",
  landArea: 0,
  builtArea: 0,
  usableArea: 0,
  totalFloors: 0,
  bedrooms: 0,
  bathrooms: 0,
  parkingSpaces: 0,
  housePrice: 0,
  buildYear: null,
  houseDirection: "",
  description: "",
  status: "AVAILABLE",
};

const OPTIONS = {
  houseType: [
    { label: "ເຮືອນດຽວ", value: "SINGLE" },
    { label: "ເຮືອນແຝດ", value: "TOWNHOUSE" },
    { label: "ວິນລ່າ", value: "VILLA" },
    { label: "ເຮືອນແຍກ", value: "DETACHED" },
  ],
  status: [
    { label: "ວ່າງ", value: "AVAILABLE" },
    { label: "ຈອງແລ້ວ", value: "RESERVED" },
    { label: "ຂາຍແລ້ວ", value: "SOLD" },
  ],
  direction: [
    { label: "ທິດເໜືອ", value: "ທິດເໜືອ" },
    { label: "ທິດໃຕ້", value: "ທິດໃຕ້" },
    { label: "ທິດຕາເວັນອອກ", value: "ທິດຕາເວັນອອກ" },
    { label: "ທິດຕາເວັນຕົກ", value: "ທິດຕາເວັນຕົກ" },
  ],
};

// Validation model
const validationModel = Schema.Model({
  projectId: NumberType().isRequired("ກະລຸນາເລືອກໂຄງການ"),
  zoneId: NumberType().isRequired("ກະລຸນາເລືອກໂຊນ"),
  houseNumber: StringType().isRequired("ກະລຸນາປ້ອນເລກທີ່ເຮືອນ"),
  houseType: StringType().isRequired("ກະລຸນາເລືອກປະເພດເຮືອນ"),
  landArea: NumberType()
    .isRequired("ກະລຸນາປ້ອນເນື້ອທີ່ດິນ")
    .min(1, "ເນື້ອທີ່ດິນຕ້ອງຫຼາຍກວ່າ 0"),
  builtArea: NumberType()
    .isRequired("ກະລຸນາປ້ອນພື້ນທີ່ກໍ່ສ້າງ")
    .min(1, "ພື້ນທີ່ກໍ່ສ້າງຕ້ອງຫຼາຍກວ່າ 0"),
  usableArea: NumberType()
    .isRequired("ກະລຸນາປ້ອນພື້ນທີ່ໃຊ້ສອຍ")
    .min(1, "ພື້ນທີ່ໃຊ້ສອຍຕ້ອງຫຼາຍກວ່າ 0"),
  totalFloors: NumberType()
    .isRequired("ກະລຸນາປ້ອນຈຳນວນຊັ້ນ")
    .min(1, "ຕ້ອງມີຢ່າງໜ້ອຍ 1 ຊັ້ນ"),
  bedrooms: NumberType()
    .isRequired("ກະລຸນາປ້ອນຈຳນວນຫ້ອງນອນ")
    .min(1, "ຕ້ອງມີຢ່າງໜ້ອຍ 1 ຫ້ອງນອນ"),
  bathrooms: NumberType()
    .isRequired("ກະລຸນາປ້ອນຈຳນວນຫ້ອງນ້ຳ")
    .min(1, "ຕ້ອງມີຢ່າງໜ້ອຍ 1 ຫ້ອງນ້ຳ"),
  housePrice: NumberType()
    .isRequired("ກະລຸນາປ້ອນລາຄາເຮືອນ")
    .min(0, "ລາຄາເຮືອນຕ້ອງຫຼາຍກວ່າ 0"),
  status: StringType().isRequired("ກະລຸນາເລືອກສະຖານະ"),
});

const HouseForm = ({ open, onClose, house, projects }: HouseFormProps) => {
  const formRef = useRef<any>(null);
  const { createHouse, updateHouse, isLoading } = useHouseStore();

  // ✅ ใช้ Area Store แทนการคำนวณเอง
  const {
    zoneArea,
    fetchZoneArea,
    loading: loadingArea,
    clear: clearAreaData,
  } = useAreaStore();

  const [formValue, setFormValue] = useState<FormValue>(INITIAL_FORM_VALUE);
  const [areaWarning, setAreaWarning] = useState("");

  // Get all zones from projects filtered by HOUSE type
  const allZones = useMemo(() => {
    if (!projects) return [];
    return projects.flatMap((project: any) =>
      (project.zones || [])
        .filter((zone: any) => zone.zoneType === "HOUSE")
        .map((zone: any) => ({
          ...zone,
          projectId: project.projectId,
        }))
    );
  }, [projects]);

  // Get zones filtered by selected project
  const filteredZones = useMemo(() => {
    if (!formValue.projectId) return [];
    return allZones.filter(
      (z) => Number(z.projectId) === Number(formValue.projectId)
    );
  }, [formValue.projectId, allZones]);

  // Calculate usableArea = landArea - builtArea
  useEffect(() => {
    const land = formValue.landArea ?? 0;
    const built = formValue.builtArea ?? 0;
    const usable = Math.max(0, land - built);
    setFormValue((prev) => ({ ...prev, usableArea: usable }));
  }, [formValue.landArea, formValue.builtArea]);

  // Calculate land price
  const calculateLandPrice = useCallback(
    (zoneId: number | null, landArea: number): number => {
      if (!zoneId || landArea <= 0) return 0;
      const zone = allZones.find((z) => z.zoneId === zoneId);
      return zone?.pricePerSqm ? landArea * zone.pricePerSqm : 0;
    },
    [allZones]
  );

  // ✅ ฟังก์ชันตรวจสอบพื้นที่จาก API
  const checkZoneArea = useCallback(
    (requestedArea: number) => {
      if (!formValue.zoneId || requestedArea <= 0) {
        setAreaWarning("");
        return;
      }

      // ถ้ายังไม่มีข้อมูลจาก API
      if (!zoneArea || zoneArea.zoneId !== formValue.zoneId) {
        return;
      }

      // ถ้ากำลังแก้ไข House ต้องหัก area ของ House นี้ออกก่อน
      let actualRemainingArea = zoneArea.remainingArea;

      if (house) {
        // เพิ่มพื้นที่ของ house ที่กำลังแก้กลับเข้าไป
        actualRemainingArea += Number(house.landArea);
      }

      if (requestedArea > actualRemainingArea) {
        setAreaWarning(
          `ເນື້ອທີ່ດິນເກີນພື້ນທີ່ທີ່ເຫຼືອຂອງໂຊນ! ພື້ນທີ່ເຫຼືອ: ${formatArea(
            actualRemainingArea
          )} m²`
        );
      } else {
        setAreaWarning("");
      }
    },
    [formValue.zoneId, zoneArea, house]
  );

  // Handle land area change
  const handleLandAreaChange = useCallback(
    (value: string | number | null) => {
      const area = Number(value) || 0;
      checkZoneArea(area);

      // Auto-calculate land price
      const landPrice = calculateLandPrice(formValue.zoneId, area);

      setFormValue((prev) => ({
        ...prev,
        landArea: area,
        landPrice,
      }));
    },
    [checkZoneArea, calculateLandPrice, formValue.zoneId]
  );

  // Handle project change
  const handleProjectChange = useCallback((projectId: number | null) => {
    setFormValue((prev) => ({
      ...prev,
      projectId,
      zoneId: null,
      landArea: 0,
      landPrice: 0,
      totalPrice: 0,
    }));
    setAreaWarning("");
    clearAreaData();
  }, [clearAreaData]);

  // ✅ เมื่อเปลี่ยน Zone -> Fetch area data
  const handleZoneChange = useCallback(
    (zoneId: number | null) => {
      setFormValue((prev) => ({
        ...prev,
        zoneId,
      }));

      if (zoneId) {
        fetchZoneArea(String(zoneId)).then(() => {
          // หลังจาก fetch เสร็จ ให้ตรวจสอบพื้นที่
          setTimeout(() => {
            checkZoneArea(formValue.landArea);
          }, 100);
        });
      } else {
        clearAreaData();
        setAreaWarning("");
      }
    },
    [fetchZoneArea, clearAreaData, checkZoneArea, formValue.landArea]
  );

  // Update land price when zone changes
  useEffect(() => {
    if (formValue.zoneId && formValue.landArea > 0) {
      const landPrice = calculateLandPrice(
        formValue.zoneId,
        formValue.landArea
      );
      setFormValue((prev) => ({ ...prev, landPrice }));
    }
  }, [formValue.zoneId, formValue.landArea, calculateLandPrice]);

  // ✅ ตรวจสอบพื้นที่ทุกครั้งที่ zoneArea เปลี่ยน
  useEffect(() => {
    if (formValue.zoneId && formValue.landArea > 0) {
      checkZoneArea(formValue.landArea);
    }
  }, [zoneArea, formValue.zoneId, formValue.landArea, checkZoneArea]);

  // Load data when editing
  useEffect(() => {
    if (house && open) {
      const zone = allZones.find((z) => z.zoneId === Number(house.zoneId));
      const projectId = zone?.projectId || null;

      setFormValue({
        projectId,
        zoneId: Number(house.zoneId),
        houseNumber: house.houseNumber,
        houseType: house.houseType,
        landArea: Number(house.landArea),
        builtArea: Number(house.builtArea),
        usableArea: Number(house.usableArea),
        totalFloors: Number(house.totalFloors),
        bedrooms: Number(house.bedrooms),
        bathrooms: Number(house.bathrooms),
        parkingSpaces: Number(house.parkingSpaces),
        housePrice: Number(house.housePrice),
        buildYear: house.buildYear ?? null,
        houseDirection: house.houseDirection || "",
        description: house.description || "",
        status: house.status,
      });

      // ✅ Fetch area data สำหรับ zone ที่เลือก
      if (house.zoneId) {
        fetchZoneArea(String(house.zoneId));
      }

      setAreaWarning("");
    } else if (!house && open) {
      setFormValue(INITIAL_FORM_VALUE);
      setAreaWarning("");
      clearAreaData();
    }
  }, [house, open, allZones, fetchZoneArea, clearAreaData]);

  // Handle form submission
  const handleSubmit = async () => {
    if (!formRef.current?.check()) {
      toaster.push(
        <Message showIcon type="error">
          ກະລຸນາຕື່ມຂໍ້ມູນໃຫ້ຄົບຖ້ວນ
        </Message>,
        { placement: "topEnd" }
      );
      return;
    }

    if (areaWarning) {
      toaster.push(
        <Message showIcon type="error">
          {areaWarning}
        </Message>,
        { placement: "topEnd" }
      );
      return;
    }

    if (!formValue.projectId) {
      toaster.push(
        <Message showIcon type="error">
          ກະລຸນາເລືອກໂຄງການກ່ອນ
        </Message>,
        { placement: "topEnd" }
      );
      return;
    }

    try {
      const data: HouseCreateInput = {
        ...formValue,
        zoneId: String(formValue.zoneId!),
        buildYear: formValue.buildYear || null,
        houseDirection: formValue.houseDirection || null,
        description: formValue.description || null,
      };

      if (house) {
        await updateHouse(house.id, data);
        toaster.push(
          <Message showIcon type="success">
            ອັບເດດສຳເລັດ
          </Message>,
          { placement: "topEnd" }
        );
      } else {
        await createHouse(data);
        toaster.push(
          <Message showIcon type="success">
            ສ້າງສຳເລັດ
          </Message>,
          { placement: "topEnd" }
        );
      }
      onClose();
    } catch (error: any) {
      toaster.push(
        <Message showIcon type="error">
          {error?.response?.data?.message || "ບໍ່ສາມາດບັນທຶກໄດ້"}
        </Message>,
        { placement: "topEnd" }
      );
    }
  };

  // Reset form and close modal
  const handleClose = useCallback(() => {
    setFormValue(INITIAL_FORM_VALUE);
    setAreaWarning("");
    clearAreaData();
    onClose();
  }, [onClose, clearAreaData]);

  // Prepare project options
  const projectOptions = useMemo(
    () =>
      projects.map((p) => ({
        label: `${p.projectName} (${formatArea(p.totalLandArea)} m²)`,
        value: Number(p.projectId),
      })),
    [projects]
  );

  // Prepare zone options
  const zoneOptions = useMemo(
    () =>
      filteredZones.map((z) => ({
        label: `${z.zoneName} (${formatArea(z.totalLandArea)} m²)`,
        value: Number(z.zoneId),
      })),
    [filteredZones]
  );

  // Determine zone placeholder text
  const zonePlaceholder = useMemo(() => {
    if (!formValue.projectId) return "ກະລຸນາເລືອກໂຄງການກ່ອນ";
    if (filteredZones.length === 0) return "ໂຄງການນີ້ບໍ່ມີໂຊນ";
    return "ເລືອກໂຊນ";
  }, [formValue.projectId, filteredZones.length]);

  const isZoneDisabled = !formValue.projectId || filteredZones.length === 0;

  // ✅ แสดงข้อมูลจาก API
  const renderZoneInfo = () => {
    if (!formValue.zoneId) return null;

    const selectedZone = allZones.find((z) => z.zoneId === formValue.zoneId);
    if (!selectedZone) return null;

    // รอข้อมูลจาก API
    if (loadingArea) {
      return (
        <div className="bg-gray-100 p-3 rounded mt-2 text-sm text-center">
          <Loader size="xs" content="ກຳລັງໂຫຼດຂໍ້ມູນ..." />
        </div>
      );
    }

    // ถ້ายังไม่มีข้อมูล หรือข้อมูลไม่ตรงกับ zone ที่เลือก
    if (!zoneArea || zoneArea.zoneId !== formValue.zoneId) {
      return (
        <div className="bg-gray-100 p-3 rounded mt-2 text-sm">
          <div className="flex items-center text-gray-600 gap-2">
            <BarChart2 size={16} className="shrink-0" />
            <span>
              ພື້ນທີ່ທັງໝົດ:{" "}
              <strong>{formatArea(selectedZone.totalLandArea)} m²</strong>
            </span>
          </div>
        </div>
      );
    }

    // คำนวณพื้นที่ที่เหลือจริง (ถ้ากำลังแก้ไข ให้บวกพื้นที่เดิมกลับเข้าไป)
    let actualRemainingArea = zoneArea.remainingArea;
    let actualUsedArea = zoneArea.usedArea;

    if (house) {
      actualRemainingArea += Number(house.landArea);
      actualUsedArea -= Number(house.landArea);
    }

    const utilization =
      zoneArea.totalArea > 0
        ? ((actualUsedArea / zoneArea.totalArea) * 100).toFixed(1)
        : 0;

    return (
      <div className="bg-gray-100 p-3 rounded mt-2 text-sm">
        <div className="flex items-center text-gray-600 mb-2 gap-2">
          <BarChart2 size={16} className="shrink-0" />
          <span>
            ພື້ນທີ່ທັງໝົດ:{" "}
            <strong>{formatArea(zoneArea.totalArea)} m²</strong>
          </span>
        </div>

        <div className="flex items-center text-gray-600 mb-2 gap-2">
          <CheckCircle size={16} className="text-green-600 shrink-0" />
          <span>
            ໃຊ້ໄປແລ້ວ: <strong>{formatArea(actualUsedArea)} m²</strong> (
            {utilization}%)
          </span>
        </div>

        <div
          className={`flex items-center font-bold gap-2 ${
            actualRemainingArea > 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          <Circle size={16} className="shrink-0" />
          <span>ພື້ນທີ່ເຫຼືອ: {formatArea(actualRemainingArea)} m²</span>
        </div>
      </div>
    );
  };

  return (
    <Modal open={open} onClose={handleClose} size="lg" overflow>
      <Modal.Header>
        <Modal.Title>{house ? "ແກ້ໄຂເຮືອນ" : "ເພີ່ມເຮືອນໃໝ່"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {!allZones.length && !projects.length ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Loader content="ກຳລັງໂຫຼດ..." />
          </div>
        ) : (
          <Form
            ref={formRef}
            model={validationModel}
            formValue={formValue}
            onChange={(value: Record<string, any>) =>
              setFormValue((prev) => ({ ...prev, ...value }))
            }
            fluid
          >
            <Grid fluid style={{ margin: 0 }}>
              {/* Project and Zone */}
              <Row gutter={8} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={12} md={12}>
                  <Form.Group>
                    <Form.ControlLabel>ໂຄງການ *</Form.ControlLabel>
                    <SelectPicker
                      data={projectOptions}
                      value={formValue.projectId}
                      onChange={handleProjectChange}
                      placeholder="ເລືອກໂຄງການ"
                      block
                      searchable
                    />
                  </Form.Group>
                </Col>

                <Col xs={24} sm={12} md={12}>
                  <Form.Group>
                    <Form.ControlLabel>ໂຊນ *</Form.ControlLabel>
                    <SelectPicker
                      data={zoneOptions}
                      value={formValue.zoneId}
                      onChange={handleZoneChange}
                      placeholder={zonePlaceholder}
                      block
                      disabled={isZoneDisabled}
                      searchable
                    />
                    {renderZoneInfo()}
                  </Form.Group>
                </Col>
              </Row>

              {/* House Number and Type */}
              <Row gutter={8} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={12} md={12}>
                  <Form.Group>
                    <Form.ControlLabel>ເລກທີ່ເຮືອນ *</Form.ControlLabel>
                    <Form.Control name="houseNumber" placeholder="H-001" />
                  </Form.Group>
                </Col>

                <Col xs={24} sm={12} md={12}>
                  <Form.Group>
                    <Form.ControlLabel>ປະເພດເຮືອນ *</Form.ControlLabel>
                    <Form.Control
                      name="houseType"
                      accepter={SelectPicker}
                      data={OPTIONS.houseType}
                      placeholder="ເລືອກປະເພດເຮືອນ"
                      block
                      searchable={false}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Area Information */}
              <Row gutter={8} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={8} md={8}>
                  <Form.Group>
                    <Form.ControlLabel>ເນື້ອທີ່ດິນ (m²) *</Form.ControlLabel>
                    <InputNumber
                      value={formValue.landArea}
                      onChange={handleLandAreaChange}
                      placeholder="0"
                      min={0}
                      block
                    />
                    {areaWarning && (
                      <div
                        style={{ fontSize: 12, color: "#f44336", marginTop: 4 }}
                      >
                        🚫 {areaWarning}
                      </div>
                    )}
                  </Form.Group>
                </Col>

                <Col xs={24} sm={8} md={8}>
                  <Form.Group>
                    <Form.ControlLabel>ພື້ນທີ່ກໍ່ສ້າງ (m²) *</Form.ControlLabel>
                    <Form.Control
                      name="builtArea"
                      accepter={InputNumber}
                      placeholder="0"
                      min={0}
                      block
                    />
                  </Form.Group>
                </Col>

                <Col xs={24} sm={8} md={8}>
                  <Form.Group>
                    <Form.ControlLabel>ພື້ນທີ່ໃຊ້ສອຍ (m²) *</Form.ControlLabel>
                    <Form.Control
                      name="usableArea"
                      accepter={InputNumber}
                      placeholder="0"
                      min={0}
                      block
                      disabled
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Room Details */}
              <Row gutter={8} style={{ marginBottom: 16 }}>
                <Col xs={12} sm={6} md={6}>
                  <Form.Group>
                    <Form.ControlLabel>ຈຳນວນຊັ້ນ *</Form.ControlLabel>
                    <Form.Control
                      name="totalFloors"
                      accepter={InputNumber}
                      placeholder="1"
                      min={1}
                      block
                    />
                  </Form.Group>
                </Col>

                <Col xs={12} sm={6} md={6}>
                  <Form.Group>
                    <Form.ControlLabel>ຫ້ອງນອນ *</Form.ControlLabel>
                    <Form.Control
                      name="bedrooms"
                      accepter={InputNumber}
                      placeholder="1"
                      min={1}
                      block
                    />
                  </Form.Group>
                </Col>

                <Col xs={12} sm={6} md={6}>
                  <Form.Group>
                    <Form.ControlLabel>ຫ້ອງນ້ຳ *</Form.ControlLabel>
                    <Form.Control
                      name="bathrooms"
                      accepter={InputNumber}
                      placeholder="1"
                      min={1}
                      block
                    />
                  </Form.Group>
                </Col>

                <Col xs={12} sm={6} md={6}>
                  <Form.Group>
                    <Form.ControlLabel>ບ່ອນຈອດລົດ</Form.ControlLabel>
                    <Form.Control
                      name="parkingSpaces"
                      accepter={InputNumber}
                      placeholder="0"
                      min={0}
                      block
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Price Information */}
              <Row gutter={8} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={8} md={8}>
                  <Form.Group>
                    <Form.ControlLabel>ລາຄາ (LAK) *</Form.ControlLabel>
                    <Form.Control
                      name="housePrice"
                      accepter={InputNumber}
                      placeholder="0"
                      min={0}
                      step={1000000}
                      formatter={(value: any) =>
                        formatCurrencyKib(Number(value))
                      }
                      block
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Build Year and Direction */}
              <Row gutter={8} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={12} md={12}>
                  <Form.Group>
                    <Form.ControlLabel>ປີທີ່ສ້າງ</Form.ControlLabel>
                    <Form.Control
                      name="buildYear"
                      accepter={InputNumber}
                      placeholder="2024"
                      min={1900}
                      max={new Date().getFullYear()}
                      block
                    />
                  </Form.Group>
                </Col>

                <Col xs={24} sm={12} md={12}>
                  <Form.Group>
                    <Form.ControlLabel>ທິດເຮືອນ</Form.ControlLabel>
                    <Form.Control
                      name="houseDirection"
                      accepter={SelectPicker}
                      data={OPTIONS.direction}
                      placeholder="ເລືອກທິດເຮືອນ"
                      block
                      searchable={false}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Status */}
              <Row gutter={8} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={12} md={12}>
                  <Form.Group>
                    <Form.ControlLabel>ສະຖານະ *</Form.ControlLabel>
                    <Form.Control
                      name="status"
                      accepter={SelectPicker}
                      data={OPTIONS.status}
                      placeholder="ເລືອກສະຖານະ"
                      block
                      searchable={false}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Description */}
              <Row style={{ marginBottom: 0 }}>
                <Col xs={24}>
                  <Form.Group>
                    <Form.ControlLabel>ລາຍລະອຽດ</Form.ControlLabel>
                    <Input
                      as="textarea"
                      rows={4}
                      value={formValue.description}
                      onChange={(v) =>
                        setFormValue((p) => ({ ...p, description: v }))
                      }
                      placeholder="ປ້ອນລາຍລະອຽດເພີ່ມເຕີມ"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Grid>
          </Form>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button onClick={handleClose} appearance="subtle">
          ຍົກເລີກ
        </Button>
        <Button
          onClick={handleSubmit}
          appearance="primary"
          loading={isLoading}
          disabled={
            isLoading ||
            !allZones.length ||
            !projects.length ||
            loadingArea ||
            !!areaWarning
          }
        >
          {house ? "ອັບເດດ" : "ສ້າງ"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default HouseForm;
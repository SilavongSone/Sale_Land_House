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
  Grid,
  Row,
  Col,
} from "rsuite";
import { BarChart2, CheckCircle, Circle, Lock } from "lucide-react";
import { useLandPlotStore } from "../../../store/landPlotStore";
import { getZoneRemainingArea, calculateLandArea } from "../../../utils/area/calculations";
import { calculateLandPlotTotalPrice } from "../../../utils/pricing/calculations";
import { formatArea, formatCurrencyKib } from "../../../utils/formatters/formatn-number";
import type {
  LandPlot,
  LandPlotStatus,
  LandPlotCreateInput,
} from "../../../types/landPlot";
import type { ZoneAreaItem } from "../../../types/zone";
import type { House } from "../../../types/house";
import type { Project } from "../../../types/project";

const { StringType, NumberType } = Schema.Types;

interface FormValue {
  projectId: number | null;
  zoneId: number | null;
  plotNumber: string;
  landArea: number;
  plotWidth: number | null;
  plotLength: number | null;
  pricePerSqm: number;
  totalPrice: number;
  landTitleNumber: string;
  notes: string;
  status: LandPlotStatus;
}

interface LandPlotFormProps {
  open: boolean;
  onClose: () => void;
  landPlot: LandPlot | null;
  houses: House[];
  landPlots: LandPlot[];
  projects: Project[];
  preSelectedProjectId?: number;
  preSelectedZoneId?: number;
  onSuccess?: () => void; // Added this prop
}

const INITIAL_FORM_VALUE: FormValue = {
  projectId: null,
  zoneId: null,
  plotNumber: "",
  landArea: 0,
  plotWidth: null,
  plotLength: null,
  pricePerSqm: 0,
  totalPrice: 0,
  landTitleNumber: "",
  notes: "",
  status: "AVAILABLE",
};

const STATUS_OPTIONS = [
  { label: "ວ່າງ", value: "AVAILABLE" },
  { label: "ຈອງແລ້ວ", value: "RESERVED" },
  { label: "ຂາຍແລ້ວ", value: "SOLD" },
];

const validationModel = Schema.Model({
  projectId: NumberType().isRequired("ກະລຸນາເລືອກໂຄງການ"),
  zoneId: NumberType().isRequired("ກະລຸນາເລືອກໂຊນ"),
  plotNumber: StringType().isRequired("ກະລຸນາປ້ອນເລກທີ່ແປ່ນ"),
  landArea: NumberType()
    .isRequired("ກະລຸນາປ້ອນເນື້ອທີ່")
    .min(1, "ເນື້ອທີ່ຕ້ອງຫຼາຍກວ່າ 0"),
  pricePerSqm: NumberType()
    .isRequired("ກະລຸນາປ້ອນລາຄາ")
    .min(0, "ລາຄາຕ້ອງຫຼາຍກວ່າ 0"),
  totalPrice: NumberType().min(0, "ລາຄາລວມຕ້ອງຫຼາຍກວ່າ 0"),
  status: StringType().isRequired("ກະລຸນາເລືອກສະຖານະ"),
});

const LandPlotForm = ({
  open,
  onClose,
  landPlot,
  houses,
  landPlots,
  projects,
  preSelectedProjectId,
  preSelectedZoneId,
  onSuccess, // Added this
}: LandPlotFormProps) => {
  const formRef = useRef<any>(null);
  const { createLandPlot, updateLandPlot, isLoading, fetchLandPlots } = useLandPlotStore();
  const [formValue, setFormValue] = useState<FormValue>(INITIAL_FORM_VALUE);
  const [areaWarning, setAreaWarning] = useState("");

  const isPreSelected = Boolean(preSelectedProjectId && preSelectedZoneId);

  const allZones = useMemo(() => {
    return projects.flatMap((project) =>
      (project.zones || [])
        .filter((zone: any) => zone.zoneType === "LAND")
        .map((zone: any) => ({
          ...zone,
          projectId: project.projectId,
        }))
    );
  }, [projects]);

  const filteredZones = useMemo(() => {
    if (!formValue.projectId) return [];
    return allZones.filter((z) => Number(z.projectId) === Number(formValue.projectId));
  }, [formValue.projectId, allZones]);

  const availableArea = useMemo(() => {
    if (!formValue.zoneId) return 0;
    const zone = allZones.find((z) => z.zoneId === formValue.zoneId);
    if (!zone) return 0;

    const existingHouses: ZoneAreaItem[] = houses
      .filter((h) => h.zoneId === formValue.zoneId)
      .map((h) => ({ houseId: h.id, zoneId: h.zoneId, landArea: h.landArea }));

    const existingPlots: ZoneAreaItem[] = landPlots
      .filter((p) => p.zoneId === formValue.zoneId)
      .map((p) => ({ landPlotId: p.landPlotId, zoneId: p.zoneId, landArea: p.landArea }));

    return getZoneRemainingArea(
      formValue.zoneId,
      zone.totalLandArea,
      existingHouses,
      existingPlots,
      landPlot?.landPlotId,
      "LAND"
    );
  }, [formValue.zoneId, allZones, houses, landPlots, landPlot?.landPlotId]);

  useEffect(() => {
    if (formValue.zoneId && !landPlot) {
      const selectedZone = allZones.find((z: any) => z.zoneId === formValue.zoneId);
      if (selectedZone?.pricePerSqm) {
        setFormValue((prev) => ({ ...prev, pricePerSqm: selectedZone.pricePerSqm }));
      }
    }
  }, [formValue.zoneId, allZones, landPlot]);

  const checkAreaAvailability = useCallback(
    (area: number) => {
      if (!formValue.zoneId || area <= 0) {
        setAreaWarning("");
        return;
      }
      if (area > availableArea) {
        setAreaWarning(
          `ເນື້ອທີ່ແປ່ນເກີນພື້ນທີ່ທີ່ເຫຼືອຂອງໂຊນ! ພື້ນທີ່ເຫຼືອ: ${formatArea(availableArea)} m²`
        );
      } else {
        setAreaWarning("");
      }
    },
    [formValue.zoneId, availableArea]
  );

  const updateDimension = useCallback(
    (field: "plotWidth" | "plotLength", value: number | null) => {
      const width = field === "plotWidth" ? value : formValue.plotWidth;
      const length = field === "plotLength" ? value : formValue.plotLength;
      const area = width && length ? calculateLandArea(width, length) : formValue.landArea;

      setFormValue((prev) => ({ ...prev, [field]: value, landArea: area }));
      checkAreaAvailability(area);
    },
    [formValue.plotWidth, formValue.plotLength, formValue.landArea, checkAreaAvailability]
  );

  const handleAreaChange = useCallback(
    (value: string | number | null) => {
      const area = Number(value) || 0;
      setFormValue((prev) => ({ ...prev, landArea: area }));
      checkAreaAvailability(area);
    },
    [checkAreaAvailability]
  );

  const handleProjectChange = useCallback((projectId: number | null) => {
    setFormValue((prev) => ({
      ...prev,
      projectId,
      zoneId: null,
      pricePerSqm: 0,
      landArea: 0,
      plotWidth: null,
      plotLength: null,
      totalPrice: 0,
    }));
    setAreaWarning("");
  }, []);

  const handleZoneChange = useCallback((zoneId: number | null) => {
    setFormValue((prev) => ({ ...prev, zoneId }));
    setAreaWarning("");
  }, []);

  useEffect(() => {
    if (formValue.landArea && formValue.pricePerSqm) {
      const total = calculateLandPlotTotalPrice(formValue.landArea, formValue.pricePerSqm);
      setFormValue((prev) => ({ ...prev, totalPrice: total }));
    }
  }, [formValue.landArea, formValue.pricePerSqm]);

  useEffect(() => {
    if (open) {
      if (landPlot) {
        const zone = allZones.find((z: any) => z.zoneId === landPlot.zoneId);
        const projectId = zone?.projectId || null;

        setFormValue({
          projectId,
          zoneId: landPlot.zoneId,
          plotNumber: landPlot.plotNumber,
          landArea: landPlot.landArea,
          plotWidth: landPlot.plotWidth as number,
          plotLength: landPlot.plotLength as number,
          pricePerSqm: landPlot.pricePerSqm,
          totalPrice: landPlot.totalPrice,
          landTitleNumber: landPlot.landTitleNumber || "",
          notes: landPlot.notes || "",
          status: landPlot.status,
        });
      } else if (isPreSelected) {
        setFormValue({
          ...INITIAL_FORM_VALUE,
          projectId: preSelectedProjectId!,
          zoneId: preSelectedZoneId!,
        });
      } else {
        setFormValue(INITIAL_FORM_VALUE);
      }
      setAreaWarning("");
    }
  }, [landPlot, open, allZones, isPreSelected, preSelectedProjectId, preSelectedZoneId]);

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

    try {
      const data: LandPlotCreateInput = {
        ...formValue,
        zoneId: formValue.zoneId!,
        plotWidth: formValue.plotWidth || null,
        plotLength: formValue.plotLength || null,
        landTitleNumber: formValue.landTitleNumber || null,
        notes: formValue.notes || null,
      };

      if (landPlot) {
        await updateLandPlot(landPlot.landPlotId, data);
        toaster.push(
          <Message showIcon type="success">
            ອັບເດດແປ່ນດິນສຳເລັດແລ້ວ
          </Message>,
          { placement: "topEnd" }
        );
      } else {
        await createLandPlot(data);
        toaster.push(
          <Message showIcon type="success">
            ສ້າງແປ່ນດິນສຳເລັດແລ້ວ
          </Message>,
          { placement: "topEnd" }
        );
      }

      await fetchLandPlots();
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
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

  const handleClose = useCallback(() => {
    setFormValue(INITIAL_FORM_VALUE);
    setAreaWarning("");
    onClose();
  }, [onClose]);

  const projectOptions = useMemo(
    () =>
      projects.map((p) => ({
        label: `${p.projectName} (${formatArea(p.totalLandArea)} m²)`,
        value: Number(p.projectId),
      })),
    [projects]
  );

  const zoneOptions = useMemo(
    () =>
      filteredZones.map((z: any) => ({
        label: `${z.zoneName} (${formatArea(z.totalLandArea)} m²)`,
        value: Number(z.zoneId),
      })),
    [filteredZones]
  );

  const autoCalculatedArea = useMemo(
    () => calculateLandArea(formValue.plotWidth, formValue.plotLength),
    [formValue.plotWidth, formValue.plotLength]
  );

  const zonePlaceholder = useMemo(() => {
    if (!formValue.projectId) return "ກະລຸນາເລືອກໂຄງການກ່ອນ";
    if (filteredZones.length === 0) return "ໂຄງການນີ້ບໍ່ມີໂຊນແບບແປ່ນດິນ";
    return "ເລືອກໂຊນ";
  }, [formValue.projectId, filteredZones.length]);

  const isZoneDisabled = !formValue.projectId || filteredZones.length === 0;

  const renderZoneInfo = () => {
    if (!formValue.zoneId) return null;

    const zone = allZones.find((z: any) => z.zoneId === formValue.zoneId);
    if (!zone) return null;

    const remaining = availableArea;
    const usedArea = zone.totalLandArea - remaining;
    const utilization =
      zone.totalLandArea > 0 ? ((usedArea / zone.totalLandArea) * 100).toFixed(1) : "0";

    return (
      <div className="bg-gray-100 p-3 rounded mt-2 text-sm">
        <div className="flex items-center text-gray-600 mb-2 gap-2">
          <BarChart2 size={16} className="shrink-0" />
          <span className="wrap-break-word">
            ພື້ນທີ່ທັງໝົດ: <strong>{formatArea(zone.totalLandArea)} m²</strong>
          </span>
        </div>

        <div className="flex items-center text-gray-600 mb-2 gap-2">
          <CheckCircle size={16} className="text-green-600 shrink-0" />
          <span className="wrap-break-word">
            ໃຊ້ໄປແລ້ວ: <strong>{formatArea(usedArea)} m²</strong> ({utilization}%)
          </span>
        </div>

        <div
          className={`flex items-center font-bold gap-2 ${
            remaining > 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          <Circle size={16} className="shrink-0" />
          <span className="wrap-break-word">ພື້ນທີ່ເຫຼືອ: {formatArea(remaining)} m²</span>
        </div>
      </div>
    );
  };

  return (
    <Modal open={open} onClose={handleClose} size="md" overflow>
      <Modal.Header>
        <Modal.Title>
          {landPlot ? "ແກ້ໄຂແປ່ນດິນ" : "ສ້າງແປ່ນດິນໃໝ່"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {!allZones.length && !projects.length ? (
          <div className="text-center py-10">
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
            <div className="w-full">
              <Grid fluid className="m-0">
                <Row gutter={8} className="mb-4">
                  <Col xs={24} sm={24} md={12}>
                    <Form.Group>
                      <Form.ControlLabel>
                        ໂຄງການ * 
                        {isPreSelected && (
                          <span className="ml-2 text-xs text-blue-600 inline-flex items-center gap-1">
                            <Lock size={12} /> 
                          </span>
                        )}
                      </Form.ControlLabel>
                      <SelectPicker
                        data={projectOptions}
                        value={formValue.projectId}
                        onChange={handleProjectChange}
                        placeholder="ເລືອກໂຄງການ"
                        block
                        searchable
                        disabled={isPreSelected}
                        style={isPreSelected ? { 
                          backgroundColor: '#f3f4f6', 
                          cursor: 'not-allowed',
                          opacity: 0.7
                        } : {}}
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={24} sm={24} md={12}>
                    <Form.Group>
                      <Form.ControlLabel>
                        ໂຊນ *
                        {isPreSelected && (
                          <span className="ml-2 text-xs text-blue-600 inline-flex items-center gap-1">
                            <Lock size={12} />
                          </span>
                        )}
                      </Form.ControlLabel>
                      <SelectPicker
                        data={zoneOptions}
                        value={formValue.zoneId}
                        onChange={handleZoneChange}
                        placeholder={zonePlaceholder}
                        block
                        disabled={isPreSelected || isZoneDisabled}
                        searchable
                        style={isPreSelected ? { 
                          backgroundColor: '#f3f4f6', 
                          cursor: 'not-allowed',
                          opacity: 0.7
                        } : {}}
                      />
                      {renderZoneInfo()}
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-4">
                  <Col xs={24}>
                    <Form.Group>
                      <Form.ControlLabel>ເລກທີ່ແປ່ນ *</Form.ControlLabel>
                      <Form.Control name="plotNumber" placeholder="A-001" />
                    </Form.Group>
                  </Col>
                </Row>

                <Row gutter={8} className="mb-4">
                  <Col xs={24} sm={8} md={8}>
                    <Form.Group>
                      <Form.ControlLabel>ກວ້າງ (m)</Form.ControlLabel>
                      <InputNumber
                        value={formValue.plotWidth}
                        onChange={(v) => updateDimension("plotWidth", Number(v) || null)}
                        placeholder="0"
                        min={0}
                        block
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={24} sm={8} md={8}>
                    <Form.Group>
                      <Form.ControlLabel>ຍາວ (m)</Form.ControlLabel>
                      <InputNumber
                        value={formValue.plotLength}
                        onChange={(v) => updateDimension("plotLength", Number(v) || null)}
                        placeholder="0"
                        min={0}
                        block
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={24} sm={8} md={8}>
                    <Form.Group>
                      <Form.ControlLabel>ເນື້ອທີ່ (m²) *</Form.ControlLabel>
                      <InputNumber
                        value={formValue.landArea}
                        onChange={handleAreaChange}
                        placeholder="0"
                        min={0}
                        block
                        disabled
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        ຄິດໄລ່ອັດຕະໂນມັດ: ກວ້າງ × ຍາວ = {formatArea(autoCalculatedArea)} m²
                      </div>
                      {areaWarning && (
                        <div className="text-xs text-red-500 mt-1">⚠️ {areaWarning}</div>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                <Row gutter={8} className="mb-4">
                  <Col xs={24} sm={24} md={12}>
                    <Form.Group>
                      <Form.ControlLabel>ລາຄາຕໍ່ m² (LAK) *</Form.ControlLabel>
                      <InputNumber
                        value={formValue.pricePerSqm}
                        disabled
                        formatter={(value) => formatCurrencyKib(Number(value))}
                        block
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={24} sm={24} md={12}>
                    <Form.Group>
                      <Form.ControlLabel>ລາຄາລວມ (LAK) *</Form.ControlLabel>
                      <InputNumber
                        value={formValue.totalPrice}
                        disabled
                        formatter={(value) => formatCurrencyKib(Number(value))}
                        block
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row gutter={8} className="mb-4">
                  <Col xs={24} sm={24} md={12}>
                    <Form.Group>
                      <Form.ControlLabel>ໃບຕາດິນ</Form.ControlLabel>
                      <Form.Control name="landTitleNumber" placeholder="ປ້ອນເລກໃບຕາດິນ" />
                    </Form.Group>
                  </Col>

                  <Col xs={24} sm={24} md={12}>
                    <Form.Group>
                      <Form.ControlLabel>ສະຖານະ *</Form.ControlLabel>
                      <Form.Control
                        name="status"
                        accepter={SelectPicker}
                        data={STATUS_OPTIONS}
                        placeholder="ເລືອກສະຖານະ"
                        block
                        searchable={false}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-0">
                  <Col xs={24}>
                    <Form.Group>
                      <Form.ControlLabel>ໝາຍເຫດ</Form.ControlLabel>
                      <Form.Control
                        name="notes"
                        componentClass="textarea"
                        rows={4}
                        placeholder="ປ້ອນໝາຍເຫດ (ຖ້າມີ)"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Grid>
            </div>
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
          disabled={isLoading || !allZones.length || !projects.length || !!areaWarning}
        >
          {landPlot ? "ອັບເດດ" : "ສ້າງ"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default LandPlotForm;
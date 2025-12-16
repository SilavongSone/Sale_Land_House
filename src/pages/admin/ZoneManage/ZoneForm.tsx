import { useEffect, useState, useRef } from "react";
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
import { BarChart2, CheckCircle, Circle } from "lucide-react";
import { useZoneStore } from "../../../store/zoneStore";
import { useProjectStore } from "../../../store/projectStore";
import { getProjectRemainingArea } from "../../../utils/area/calculations";
import { formatArea } from "../../../utils/formatters/formatn-number";
import type { Zone, ZoneCreateInput } from "../../../types/zone";
import type { ProjectAreaItem } from "../../../types/project";

const { StringType, NumberType } = Schema.Types;

interface FormValue {
  zoneName: string;
  projectId: number | null;
  zoneType: string;
  totalLandArea: number;
  pricePerSqm: number;
  persen: number;
  description: string;
  status: "ACTIVE" | "INACTIVE";
}

const model = Schema.Model({
  zoneName: StringType()
    .isRequired("ກະລຸນາປ້ອນຊື່ໂຊນ")
    .minLength(2, "ຊື່ໂຊນຕ້ອງມີຢ່າງໜ້ອຍ 2 ຕົວອັກສອນ"),
  projectId: NumberType().isRequired("ກະລຸນາເລືອກໂຄງການ"),
  zoneType: StringType().isRequired("ກະລຸນາເລືອກປະເພດໂຊນ"),
  totalLandArea: NumberType()
    .isRequired("ກະລຸນາປ້ອນເນື້ອທີ່ທັງໝົດ")
    .min(1, "ເນື້ອທີ່ຕ້ອງຫຼາຍກວ່າ 0"),
  pricePerSqm: NumberType()
    .isRequired("ກະລຸນາປ້ອນລາຄາຕໍ່ຕາແມັດ")
    .min(0, "ລາຄາຕ້ອງຫຼາຍກວ່າຫຼືເທົ່າກັບ 0"),
  persen: NumberType()
    .isRequired("ກະລຸນາປ້ອນເປີເຊັນ")
    .min(0, "ເປີເຊັນຕ້ອງຫຼາຍກວ່າຫຼືເທົ່າກັບ 0")
    .max(100, "ເປີເຊັນຕ້ອງນ້ອຍກວ່າຫຼືເທົ່າກັບ 100"),
  description: StringType(),
  status: StringType().isRequired("ກະລຸນາເລືອກສະຖານະ"),
});

const initialFormValue: FormValue = {
  zoneName: "",
  projectId: null,
  zoneType: "",
  totalLandArea: 0,
  pricePerSqm: 0,
  persen: 0,
  description: "",
  status: "ACTIVE",
};

const ZoneForm = ({
  open,
  onClose,
  zone,
}: {
  open: boolean;
  onClose: () => void;
  zone: Zone | null;
}) => {
  const formRef = useRef<any>(null);
  const { zones, createZone, updateZone, isLoading } = useZoneStore();
  const {
    projectOptions, // ✅ Changed from 'projects' to 'projectOptions'
    fetchProjectOptions,
    isLoading: loadingProjects,
  } = useProjectStore();

  const [formValue, setFormValue] = useState<FormValue>(initialFormValue);
  const [areaWarning, setAreaWarning] = useState("");

  useEffect(() => {
    if (open && !projectOptions.length) fetchProjectOptions(); // ✅ Changed
  }, [open, projectOptions.length, fetchProjectOptions]); // ✅ Changed

  useEffect(() => {
    if (zone && projectOptions.length > 0) { // ✅ Changed
      setFormValue({
        zoneName: zone.zoneName,
        projectId: zone.projectId,
        zoneType: zone.zoneType,
        totalLandArea: zone.totalLandArea,
        pricePerSqm: zone.pricePerSqm,
        persen: zone.persen,
        description: zone.description || "",
        status: zone.status,
      });
      setAreaWarning("");
    } else if (!zone && open) {
      setFormValue(initialFormValue);
      setAreaWarning("");
    }
  }, [zone, open, projectOptions]); // ✅ Changed

  const checkProjectArea = (
    projectId: number | null,
    requestedArea: number
  ) => {
    if (!projectId || requestedArea <= 0) {
      setAreaWarning("");
      return;
    }

    const project = projectOptions.find((p) => p.projectId === projectId); // ✅ Changed
    if (!project) {
      setAreaWarning("");
      return;
    }

    const existingZones: ProjectAreaItem[] = zones.map((z) => ({
      zoneId: Number(z.zoneId),
      projectId: z.projectId,
      totalLandArea: z.totalLandArea,
    }));

    const remainingArea = getProjectRemainingArea(
      projectId,
      project.totalLandArea,
      existingZones,
      zone?.zoneId
    );

    if (requestedArea > remainingArea) {
      setAreaWarning(
        `ເນື້ອທີ່ໂຊນເກີນພື້ນທີ່ທີ່ເຫຼືອຂອງໂຄງການ! ພື້ນທີ່ເຫຼືອ: ${formatArea(
          remainingArea
        )} m²`
      );
    } else {
      setAreaWarning("");
    }
  };

  const handleProjectChange = (projectId: number | null) => {
    setFormValue((prev) => ({ ...prev, projectId }));
    checkProjectArea(projectId, formValue.totalLandArea);
  };

  const handleAreaChange = (value: string | number | null) => {
    const area = Number(value) || 0;
    setFormValue((prev) => ({ ...prev, totalLandArea: area }));
    checkProjectArea(formValue.projectId, area);
  };

  const handleSubmit = async () => {
    if (!formRef.current?.check()) {
      toaster.push(
        <Message showIcon type="error">
          ກະລຸນາຕື່ມຂໍ້ມູນໃຫ້ຄົບຖ້ວນ ແລະ ຖືກຕ້ອງ
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

    const { projectId, zoneType } = formValue;

    if (!projectId || !zoneType) {
      toaster.push(
        <Message showIcon type="error">
          ກະລຸນາເລືອກໂຄງການ ແລະ ປະເພດໂຊນ
        </Message>,
        { placement: "topEnd" }
      );
      return;
    }

    try {
      const zoneData: ZoneCreateInput = {
        zoneName: formValue.zoneName,
        projectId: formValue.projectId!,
        zoneType: formValue.zoneType,
        totalLandArea: formValue.totalLandArea,
        pricePerSqm: formValue.pricePerSqm,
        persen: formValue.persen,
        description: formValue.description || "",
        status: formValue.status,
      };

      if (zone) {
        await updateZone(zone.zoneId, zoneData);
        toaster.push(
          <Message showIcon type="success">
            ອັບເດດໂຊນສຳເລັດແລ້ວ
          </Message>,
          { placement: "topEnd" }
        );
      } else {
        await createZone(zoneData);
        toaster.push(
          <Message showIcon type="success">
            ສ້າງໂຊນສຳເລັດແລ້ວ
          </Message>,
          { placement: "topEnd" }
        );
      }
      onClose();
    } catch (error: any) {
      toaster.push(
        <Message showIcon type="error">
          {error?.response?.data?.message ||
            error?.message ||
            "ບໍ່ສາມາດບັນທຶກໂຊນໄດ້"}
        </Message>,
        { placement: "topEnd" }
      );
    }
  };

  const handleClose = () => {
    setFormValue(initialFormValue);
    setAreaWarning("");
    onClose();
  };

  const selectedProject = formValue.projectId
    ? projectOptions.find((p) => p.projectId === formValue.projectId) // ✅ Changed
    : null;

  const projectOptionsForSelect = projectOptions.map((p) => ({ // ✅ Changed variable name to avoid confusion
    label: `${p.projectName} (${formatArea(p.totalLandArea)} m²)`,
    value: p.projectId,
  }));

  const renderProjectInfo = () => {
    if (!selectedProject) return null;

    const existingZones: ProjectAreaItem[] = zones.map((z) => ({
      zoneId: Number(z.zoneId),
      projectId: z.projectId,
      totalLandArea: z.totalLandArea,
    }));

    const remainingArea = getProjectRemainingArea(
      selectedProject.projectId,
      selectedProject.totalLandArea,
      existingZones,
      zone?.zoneId
    );

    const usedArea = selectedProject.totalLandArea - remainingArea;
    const utilization =
      selectedProject.totalLandArea > 0
        ? ((usedArea / selectedProject.totalLandArea) * 100).toFixed(1)
        : 0;

    return (
      <div className="bg-gray-100 p-3 rounded mt-2 text-sm">
        <div className="flex items-center text-gray-600 mb-2 gap-2">
          <BarChart2 size={16} className="shrink-0" />
          <span className="wrap-break-word">
            ພື້ນທີ່ທັງໝົດ:{" "}
            <strong>{formatArea(selectedProject.totalLandArea)} m²</strong>
          </span>
        </div>

        <div className="flex items-center text-gray-600 mb-2 gap-2">
          <CheckCircle size={16} className="text-green-600 shrink-0" />
          <span className="wrap-break-word">
            ໃຊ້ໄປແລ້ວ: <strong>{formatArea(usedArea)} m²</strong> (
            {utilization}%)
          </span>
        </div>

        <div
          className={`flex items-center font-bold gap-2 ${
            remainingArea > 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          <Circle size={16} className="shrink-0" />
          <span className="wrap-break-word">
            ພື້ນທີ່ເຫຼືອ: {formatArea(remainingArea)} m²
          </span>
        </div>
      </div>
    );
  };

  return (
    <Modal open={open} onClose={handleClose} size="md" overflow>
      <Modal.Header>
        <Modal.Title>{zone ? "ແກ້ໄຂໂຊນ" : "ສ້າງໂຊນໃໝ່"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {loadingProjects ? (
          <div className="text-center py-10">
            <Loader content="ກຳລັງໂຫຼດຂໍ້ມູນໂຄງການ..." />
          </div>
        ) : (
          <Form
            ref={formRef}
            model={model}
            formValue={formValue}
            onChange={(value: Record<string, any>) =>
              setFormValue((prev) => ({
                ...prev,
                ...value,
              }))
            }
            fluid
          >
            <div className="w-full">
              <Grid fluid className="m-0">
                {/* Project and Zone Type - 2 Columns on larger screens */}
                <Row gutter={8} className="mb-4">
                  <Col xs={24} sm={24} md={12}>
                    <Form.Group>
                      <Form.ControlLabel>ໂຄງການ *</Form.ControlLabel>
                      <SelectPicker
                        data={projectOptionsForSelect} // ✅ Changed
                        value={formValue.projectId}
                        onChange={handleProjectChange}
                        placeholder="ເລືອກໂຄງການ"
                        block
                        searchable
                      />
                      {renderProjectInfo()}
                    </Form.Group>
                  </Col>

                  <Col xs={24} sm={24} md={12}>
                    <Form.Group>
                      <Form.ControlLabel>ປະເພດໂຊນ *</Form.ControlLabel>
                      <Form.Control
                        name="zoneType"
                        accepter={SelectPicker}
                        data={[
                          { label: "ໂຊນທີ່ດິນ", value: "LAND" },
                          { label: "ໂຊນເຮືອນ", value: "HOUSE" },
                        ]}
                        placeholder="ເລືອກປະເພດໂຊນ"
                        block
                        searchable={false}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Zone Name - Full Width */}
                <Row className="mb-4">
                  <Col xs={24}>
                    <Form.Group>
                      <Form.ControlLabel>ຊື່ໂຊນ *</Form.ControlLabel>
                      <Form.Control name="zoneName" placeholder="ປ້ອນຊື່ໂຊນ" />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Total Land Area - Full Width */}
                <Row className="mb-4">
                  <Col xs={24}>
                    <Form.Group>
                      <Form.ControlLabel>
                        ເນື້ອທີ່ທັງໝົດ (m²) *
                      </Form.ControlLabel>
                      <InputNumber
                        value={formValue.totalLandArea}
                        onChange={handleAreaChange}
                        placeholder="0"
                        min={0}
                        block
                      />
                      {areaWarning && (
                        <div className="text-xs text-red-500 mt-1">
                          🚫 {areaWarning}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                {/* Price and Percentage - 2 Columns on larger screens */}
                <Row gutter={8} className="mb-4">
                  <Col xs={24} sm={24} md={12}>
                    <Form.Group>
                      <Form.ControlLabel>
                        ລາຄາຕໍ່ຕາແມັດ (LAK/m²) *
                      </Form.ControlLabel>
                      <Form.Control
                        name="pricePerSqm"
                        accepter={InputNumber}
                        placeholder="0"
                        min={0}
                        step={1000}
                        formatter={(v: any) =>
                          `₭ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={24} sm={24} md={12}>
                    <Form.Group>
                      <Form.ControlLabel>ເປີເຊັນຂາຍ (%) *</Form.ControlLabel>
                      <Form.Control
                        name="persen"
                        accepter={InputNumber}
                        placeholder="0"
                        min={0}
                        max={100}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Description - Full Width */}
                <Row className="mb-4">
                  <Col xs={24}>
                    <Form.Group>
                      <Form.ControlLabel>ລາຍລະອຽດ</Form.ControlLabel>
                      <Form.Control
                        name="description"
                        componentClass="textarea"
                        rows={4}
                        placeholder="ປ້ອນລາຍລະອຽດໂຊນ (ຖ້າມີ)"
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
          disabled={isLoading || loadingProjects || !!areaWarning}
        >
          {zone ? "ອັບເດດ" : "ສ້າງ"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ZoneForm;
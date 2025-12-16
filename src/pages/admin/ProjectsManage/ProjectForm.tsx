import { useEffect, useState, useRef, useCallback } from "react";
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
import { useProjectStore } from "../../../store/projectStore";
import { calculateLandArea } from "../../../utils/area/calculations";
import { formatArea,formatCurrencyKib } from "../../../utils/formatters/formatn-number";

import type { Project, ProjectStatus } from "../../../types/project";
import type { ProvinceAttributes, District } from "../../../types/province";

const { StringType, NumberType } = Schema.Types;

interface FormValue {
  projectName: string;
  totalLandArea: number;
  totalWidth: number;
  totalLength: number;
  village: string;
  provinceId: number | null;
  districtId: number | null;
  landOwnerName: string;
  landOwnerPhone: string;
  price: number;
  description: string;
  status: ProjectStatus;
}

interface ProjectFormProps {
  open: boolean;
  onClose: () => void;
  project: Project | null;
  provinces: ProvinceAttributes[];
  loadingProvinces: boolean;
}

// Schema validation model
const validationModel = Schema.Model({
  projectName: StringType()
    .isRequired("ກະລຸນາປ້ອນຊື່ໂຄງການ")
    .minLength(3, "ຊື່ໂຄງການຕ້ອງມີຢ່າງໜ້ອຍ 3 ຕົວອັກສອນ"),
  // totalLandArea: NumberType()
  //   .isRequired("ກະລຸນາປ້ອນເນື້ອທີ່ທັງໝົດ")
  //   .min(1, "ເນື້ອທີ່ຕ້ອງຫຼາຍກວ່າ 0"),
  totalWidth: NumberType()
    .isRequired("ກະລຸນາປ້ອນຄວາມກວ້າງ")
    .min(1, "ຄວາມກວ້າງຕ້ອງຫຼາຍກວ່າ 0"),
  totalLength: NumberType()
    .isRequired("ກະລຸນາປ້ອນຄວາມຍາວ")
    .min(1, "ຄວາມຍາວຕ້ອງຫຼາຍກວ່າ 0"),
  village: StringType().isRequired("ກະລຸນາປ້ອນຊື່ບ້ານ"),
  provinceId: NumberType().isRequired("ກະລຸນາເລືອກແຂວງ"),
  districtId: NumberType().isRequired("ກະລຸນາເລືອກເມືອງ"),
  landOwnerName: StringType()
    .isRequired("ກະລຸນາປ້ອນຊື່ເຈົ້າຂອງທີ່ດິນ")
    .minLength(2, "ຊື່ຕ້ອງມີຢ່າງໜ້ອຍ 2 ຕົວອັກສອນ"),
  landOwnerPhone: StringType()
    .isRequired("ກະລຸນາປ້ອນເບີໂທລະສັບ")
    .pattern(/^[0-9]{8,15}$/, "ກະລຸນາປ້ອນເບີໂທທີ່ຖືກຕ້ອງ"),
  price: NumberType()
    .isRequired("ກະລຸນາປ້ອນລາຄາ")
    .min(1, "ລາຄາຕ້ອງຫຼາຍກວ່າຫຼືເທົ່າກັບ 0"),
  description: StringType(),
});

// Initial form state
const INITIAL_FORM_VALUE: FormValue = {
  projectName: "",
  totalLandArea: 0,
  totalWidth: 0,
  totalLength: 0,
  village: "",
  provinceId: null,
  districtId: null,
  landOwnerName: "",
  landOwnerPhone: "",
  price: 0,
  description: "",
  status: "ACTIVE",
};

const ProjectForm = ({
  open,
  onClose,
  project,
  provinces,
  loadingProvinces,
}: ProjectFormProps) => {
  const formRef = useRef<any>(null);
  const { createProject, updateProject, isLoading } = useProjectStore();

  const [formValue, setFormValue] = useState<FormValue>(INITIAL_FORM_VALUE);

  // Initialize form with project data or reset
  useEffect(() => {
    if (project && provinces.length > 0) {
      const province = provinces.find((p) =>
        p.districts?.some((d) => d.districtId === project.districtId)
      );

      setFormValue({
        projectName: project.projectName,
        totalLandArea: project.totalLandArea,
        totalWidth: project.totalWidth,
        totalLength: project.totalLength,
        village: project.village,
        provinceId: province?.provinceId || null,
        districtId: project.districtId,
        landOwnerName: project.landOwnerName,
        landOwnerPhone: project.landOwnerPhone,
        price: project.price,
        description: project.description || "",
        status: project.status,
      });
    } else if (!project && open) {
      setFormValue(INITIAL_FORM_VALUE);
    }
  }, [project, open, provinces]);

  // Handle form submission
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

    const { provinceId, districtId, ...rest } = formValue;

    if (!districtId) {
      toaster.push(
        <Message showIcon type="error">
          ກະລຸນາເລືອກເມືອງ
        </Message>,
        { placement: "topEnd" }
      );
      return;
    }

    try {
      const projectData: Partial<Project> = { ...rest, districtId };

      if (project) {
        await updateProject(project.projectId, projectData);
        toaster.push(
          <Message showIcon type="success">
            ອັບເດດໂຄງການສຳເລັດແລ້ວ
          </Message>,
          { placement: "topEnd" }
        );
      } else {
        await createProject(projectData);
        toaster.push(
          <Message showIcon type="success">
            ສ້າງໂຄງການສຳເລັດແລ້ວ
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
            "ບໍ່ສາມາດບັນທຶກໂຄງການໄດ້"}
        </Message>,
        { placement: "topEnd" }
      );
    }
  };

  // Reset form and close modal
  const handleClose = useCallback(() => {
    setFormValue(INITIAL_FORM_VALUE);
    onClose();
  }, [onClose]);

  // Prepare dropdown options
  const provinceOptions = provinces.map((p) => ({
    label: p.provinceName,
    value: p.provinceId,
  }));

  const districtOptions = formValue.provinceId
    ? (
        provinces.find((p) => p.provinceId === formValue.provinceId)
          ?.districts || []
      ).map((d: District) => ({ label: d.districtName, value: d.districtId }))
    : [];

  // Calculate auto-calculated area for display
  const autoCalculatedArea = calculateLandArea(
    formValue.totalWidth,
    formValue.totalLength
  );

  return (
    <Modal open={open} onClose={handleClose} size="md" overflow>
      <Modal.Header>
        <Modal.Title>{project ? "ແກ້ໄຂໂຄງການ" : "ສ້າງໂຄງການໃໝ່"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {loadingProvinces ? (
          <div className="text-center py-10">
            <Loader content="ກຳລັງໂຫຼດຂໍ້ມູນແຂວງ..." />
          </div>
        ) : (
          <Form
            ref={formRef}
            model={validationModel}
            formValue={formValue}
            onChange={(value: Record<string, any>) => {
              // Auto-calculate area when width or length changes
              if ("totalWidth" in value || "totalLength" in value) {
                const width = value.totalWidth ?? formValue.totalWidth;
                const length = value.totalLength ?? formValue.totalLength;
                const area = calculateLandArea(width, length);

                setFormValue((prev) => ({
                  ...prev,
                  ...value,
                  totalLandArea: area,
                }));
              } else {
                setFormValue((prev) => ({ ...prev, ...value }));
              }
            }}
            fluid
          >
            <div className="w-full">
              <Grid fluid className="m-0">
                {/* Project Name - Full Width */}
                <Row className="mb-4">
                  <Col xs={24}>
                    <Form.Group>
                      <Form.ControlLabel>ຊື່ໂຄງການ *</Form.ControlLabel>
                      <Form.Control
                        name="projectName"
                        placeholder="ປ້ອນຊື່ໂຄງການ"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Area Dimensions - 3 Columns */}
                <Row gutter={8} className="mb-4">
                  <Col xs={24} sm={8} md={8}>
                    <Form.Group>
                      <Form.ControlLabel>ຄວາມກວ້າງ (m) *</Form.ControlLabel>
                      <Form.Control
                        name="totalWidth"
                        accepter={InputNumber}
                        placeholder="0"
                        min={0}
                        block
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={24} sm={8} md={8}>
                    <Form.Group>
                      <Form.ControlLabel>ຄວາມຍາວ (m) *</Form.ControlLabel>
                      <Form.Control
                        name="totalLength"
                        accepter={InputNumber}
                        placeholder="0"
                        min={0}
                        block
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={24} sm={8} md={8}>
                    <Form.Group>
                      <Form.ControlLabel>
                        ເນື້ອທີ່ທັງໝົດ (m²) *
                      </Form.ControlLabel>
                      <Form.Control
                        name="totalLandArea"
                        accepter={InputNumber}
                        placeholder="0"
                        min={0}
                        block
                        disabled
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        ຄິດໄລ່ອັດຕະໂນມັດ: ກວ້າງ × ຍາວ ={" "}
                        {formatArea(autoCalculatedArea)} m²
                      </div>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Location - 3 Columns */}
                <Row gutter={8} className="mb-4">
                  <Col xs={24} sm={8}>
                    <Form.Group>
                      <Form.ControlLabel>ບ້ານ *</Form.ControlLabel>
                      <Form.Control name="village" placeholder="ປ້ອນຊື່ບ້ານ" />
                    </Form.Group>
                  </Col>

                  <Col xs={24} sm={8}>
                    <Form.Group>
                      <Form.ControlLabel>ແຂວງ *</Form.ControlLabel>
                      <SelectPicker
                        data={provinceOptions}
                        value={formValue.provinceId}
                        onChange={(v) =>
                          setFormValue((prev) => ({
                            ...prev,
                            provinceId: v,
                            districtId: null,
                          }))
                        }
                        placeholder="ເລືອກແຂວງ"
                        block
                        loading={loadingProvinces}
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={24} sm={8}>
                    <Form.Group>
                      <Form.ControlLabel>ເມືອງ *</Form.ControlLabel>
                      <Form.Control
                        name="districtId"
                        accepter={SelectPicker}
                        data={districtOptions}
                        placeholder="ກະລຸນາເລືອກແຂວງກ່ອນ"
                        block
                        disabled={
                          !formValue.provinceId || !districtOptions.length
                        }
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Land Owner Info - 2 Columns */}
                <Row gutter={8} className="mb-4">
                  <Col xs={24} sm={12}>
                    <Form.Group>
                      <Form.ControlLabel>ຊື່ເຈົ້າຂອງທີ່ດິນ *</Form.ControlLabel>
                      <Form.Control
                        name="landOwnerName"
                        placeholder="ປ້ອນຊື່ເຈົ້າຂອງ"
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={24} sm={12}>
                    <Form.Group>
                      <Form.ControlLabel>
                        ເບີໂທລະສັບເຈົ້າຂອງ *
                      </Form.ControlLabel>
                      <Form.Control
                        name="landOwnerPhone"
                        placeholder="020XXXXXXXX"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Price - Full Width */}
                <Row className="mb-4">
                  <Col xs={24}>
                    <Form.Group>
                      <Form.ControlLabel>ລາຄາ (LAK) *</Form.ControlLabel>
                      <Form.Control
                        name="price"
                        accepter={InputNumber}
                        placeholder="0"
                        min={0}
                        step={1000}
                        formatter={formatCurrencyKib}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Description - Full Width */}
                <Row className="mb-0">
                  <Col xs={24}>
                    <Form.Group>
                      <Form.ControlLabel>ລາຍລະອຽດ</Form.ControlLabel>
                      <Form.Control
                        name="description"
                        componentClass="textarea"
                        rows={4}
                        placeholder="ປ້ອນລາຍລະອຽດໂຄງກາຍ (ຖ້າມີ)"
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
          disabled={isLoading || loadingProvinces}
        >
          {project ? "ອັບເດດ" : "ສ້າງ"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProjectForm;
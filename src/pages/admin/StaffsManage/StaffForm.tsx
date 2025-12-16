import { useEffect, useState, useRef } from "react";
import {
  Modal,
  Form,
  Button,
  Schema,
  SelectPicker,
  Message,
  toaster,
  Loader,
  DatePicker,
  InputNumber,
} from "rsuite";
import { useStaffStore } from "../../../store/staffStore";
import type { Staff } from "../../../types/staff";
import type { ProvinceAttributes, District } from "../../../types/province";

const { StringType, NumberType } = Schema.Types;

interface FormValue {
  staffCode: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  village: string;
  provinceId: number | null;
  districtId: number | null;
  position: string;
  department: string;
  hireDate: Date | null;
  basicSalary: number | string | null;
  status: string;
  notes: string;
}

const model = Schema.Model({
  staffCode: StringType()
    .isRequired("ກະລຸນາປ້ອນລະຫັດພະນັກງານ")
    .minLength(3, "ລະຫັດພະນັກງານຕ້ອງມີຢ່າງໜ້ອຍ 3 ຕົວອັກສອນ"),
  firstName: StringType()
    .isRequired("ກະລຸນາປ້ອນຊື່")
    .minLength(2, "ຊື່ຕ້ອງມີຢ່າງໜ້ອຍ 2 ຕົວອັກສອນ"),
  lastName: StringType()
    .isRequired("ກະລຸນາປ້ອນນາມສະກຸນ")
    .minLength(2, "ນາມສະກຸນຕ້ອງມີຢ່າງໜ້ອຍ 2 ຕົວອັກສອນ"),
  phone: StringType()
    .isRequired("ກະລຸນາປ້ອນເບີໂທລະສັບ")
    .pattern(/^[0-9]{8,15}$/, "ກະລຸນາປ້ອນເບີໂທທີ່ຖືກຕ້ອງ"),
  email: StringType().isEmail("ກະລຸນາປ້ອນອີເມວທີ່ຖືກຕ້ອງ"),
  village: StringType(),
  districtId: NumberType().isRequired("ກະລຸນາເລືອກເມືອງ"),
  position: StringType().isRequired("ກະລຸນາປ້ອນຕຳແໜ່ງ"),
  department: StringType(),
  basicSalary: NumberType()
    .isRequired("ກະລຸນາປ້ອນເງິນເດືອນພື້ນຖານ")
    .min(0, "ເງິນເດືອນຕ້ອງບໍ່ນ້ອຍກວ່າ 0"),
  status: StringType().isRequired("ກະລຸນາເລືອກສະຖານະ"),
  notes: StringType(),
});

const initialFormValue: FormValue = {
  staffCode: "",
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  village: "",
  provinceId: null,
  districtId: null,
  position: "",
  department: "",
  hireDate: new Date(),
  basicSalary: "",
  status: "ACTIVE",
  notes: "",
};

const POSITIONS = [
  { label: "ຜູ້ຈັດການ", value: "MANAGER" },
  { label: "ພະນັກງານ", value: "STAFF" },
  { label: "ຊ່າງເທັກນິກ", value: "TECHNICIAN" },
  { label: "ບັນຊີ", value: "ACCOUNTANT" },
  { label: "ພະນັກງານຂາຍ", value: "SALES" },
];

const StaffForm = ({
  open,
  onClose,
  staff,
  provinces,
  loadingProvinces,
}: {
  open: boolean;
  onClose: () => void;
  staff: Staff | null;
  provinces: ProvinceAttributes[];
  loadingProvinces: boolean;
}) => {
  const formRef = useRef<any>(null);
  const { createStaff, updateStaff, isLoading } = useStaffStore();

  const [formValue, setFormValue] = useState<FormValue>(initialFormValue);

  useEffect(() => {
    if (staff && provinces.length > 0) {
      const province = provinces.find((p) =>
        p.districts?.some((d) => d.districtId === staff.districtId)
      );
      setFormValue({
        staffCode: staff.staffCode,
        firstName: staff.firstName,
        lastName: staff.lastName,
        phone: staff.phone,
        email: staff.email || "",
        village: staff.village || "",
        provinceId: province?.provinceId || null,
        districtId: staff.districtId || null,
        position: staff.position || "",
        department: staff.department || "",
        hireDate: staff.hireDate ? new Date(staff.hireDate) : null,
        basicSalary: staff.basicSalary || "",
        status: staff.status || "ACTIVE",
        notes: staff.notes || "",
      });
    } else if (!staff && open) {
      setFormValue(initialFormValue);
    }
  }, [staff, open, provinces]);

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
      const staffData: any = {
        ...rest,
        districtId,
        hireDate: formValue.hireDate?.toISOString() || undefined,
        basicSalary: Number(formValue.basicSalary),
      };

      if (staff) {
        await updateStaff(Number(staff.staffId), staffData);
        toaster.push(
          <Message showIcon type="success">
            ອັບເດດພະນັກງານສຳເລັດແລ້ວ
          </Message>,
          { placement: "topEnd" }
        );
      } else {
        await createStaff(staffData);
        toaster.push(
          <Message showIcon type="success">
            ສ້າງພະນັກງານສຳເລັດແລ້ວ
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
            "ບໍ່ສາມາດບັນທຶກພະນັກງານໄດ້"}
        </Message>,
        { placement: "topEnd" }
      );
    }
  };

  const provinceOpts = provinces.map((p: ProvinceAttributes) => ({
    label: p.provinceName,
    value: p.provinceId,
  }));

  const districtOpts = formValue.provinceId
    ? (
        provinces.find(
          (p: ProvinceAttributes) => p.provinceId === formValue.provinceId
        )?.districts || []
      ).map((d: District) => ({ label: d.districtName, value: d.districtId }))
    : [];

  return (
    <Modal
      open={open}
      onClose={() => {
        setFormValue(initialFormValue);
        onClose();
      }}
      size="lg"
      overflow
    >
      <Modal.Header>
        <Modal.Title>{staff ? "ແກ້ໄຂພະນັກງານ" : "ສ້າງພະນັກງານໃໝ່"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {loadingProvinces ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Loader content="ກຳລັງໂຫຼດຂໍ້ມູນແຂວງ..." />
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
            {/* Basic Information */}
            <div style={{ marginBottom: "20px" }}>
              <h5 style={{ marginBottom: "16px", fontWeight: 600 }}>
                ຂໍ້ມູນພື້ນຖານ
              </h5>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <Form.Group>
                  <Form.ControlLabel>ລະຫັດພະນັກງານ *</Form.ControlLabel>
                  <Form.Control
                    name="staffCode"
                    placeholder="ເຊັ່ນ: STF001"
                  />
                </Form.Group>

                <Form.Group>
                  <Form.ControlLabel>ວັນທີ່ເລີ່ມວຽກ *</Form.ControlLabel>
                  <DatePicker
                    value={formValue.hireDate}
                    onChange={(date) =>
                      setFormValue((prev) => ({ ...prev, hireDate: date }))
                    }
                    placeholder="ເລືອກວັນທີ່"
                    format="dd/MM/yyyy"
                    style={{ width: "100%" }}
                    oneTap
                  />
                </Form.Group>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <Form.Group>
                  <Form.ControlLabel>ຊື່ *</Form.ControlLabel>
                  <Form.Control name="firstName" placeholder="ປ້ອນຊື່" />
                </Form.Group>

                <Form.Group>
                  <Form.ControlLabel>ນາມສະກຸນ *</Form.ControlLabel>
                  <Form.Control name="lastName" placeholder="ປ້ອນນາມສະກຸນ" />
                </Form.Group>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <Form.Group>
                  <Form.ControlLabel>ເບີໂທລະສັບ *</Form.ControlLabel>
                  <Form.Control name="phone" placeholder="020XXXXXXXX" />
                </Form.Group>

                <Form.Group>
                  <Form.ControlLabel>ອີເມວ</Form.ControlLabel>
                  <Form.Control
                    name="email"
                    type="email"
                    placeholder="example@email.com"
                  />
                </Form.Group>
              </div>
            </div>

            {/* Address Information */}
            <div style={{ marginBottom: "20px" }}>
              <h5 style={{ marginBottom: "16px", fontWeight: 600 }}>ທີ່ຢູ່</h5>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "16px",
                }}
              >
                <Form.Group>
                  <Form.ControlLabel>ບ້ານ</Form.ControlLabel>
                  <Form.Control name="village" placeholder="ປ້ອນຊື່ບ້ານ" />
                </Form.Group>

                <Form.Group>
                  <Form.ControlLabel>ແຂວງ *</Form.ControlLabel>
                  <SelectPicker
                    data={provinceOpts}
                    value={formValue.provinceId}
                    onChange={(v) =>
                      setFormValue((prev) => ({
                        ...prev,
                        provinceId: v,
                        districtId: null,
                      }))
                    }
                    placeholder="ເລືອກແຂວງ"
                    style={{ width: "100%" }}
                    loading={loadingProvinces}
                  />
                </Form.Group>

                <Form.Group>
                  <Form.ControlLabel>ເມືອງ *</Form.ControlLabel>
                  <Form.Control
                    name="districtId"
                    accepter={SelectPicker}
                    data={districtOpts}
                    placeholder="ເລືອກເມືອງ"
                    style={{ width: "100%" }}
                    disabled={!formValue.provinceId || !districtOpts.length}
                  />
                </Form.Group>
              </div>
            </div>

            {/* Work Information */}
            <div style={{ marginBottom: "20px" }}>
              <h5 style={{ marginBottom: "16px", fontWeight: 600 }}>
                ຂໍ້ມູນວຽກງານ
              </h5>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <Form.Group>
                  <Form.ControlLabel>ຕຳແໜ່ງ *</Form.ControlLabel>
                  <Form.Control
                    name="position"
                    accepter={SelectPicker}
                    data={POSITIONS}
                    placeholder="ເລືອກຕຳແໜ່ງ"
                    style={{ width: "100%" }}
                  />
                </Form.Group>

                <Form.Group>
                  <Form.ControlLabel>ພະແນກ</Form.ControlLabel>
                  <Form.Control name="department" placeholder="ປ້ອນຊື່ພະແນກ" />
                </Form.Group>
              </div>

              <Form.Group>
                <Form.ControlLabel>ເງິນເດືອນພື້ນຖານ (LAK) *</Form.ControlLabel>
                <InputNumber
                  value={formValue.basicSalary}
                  onChange={(value) =>
                    setFormValue((prev) => ({ ...prev, basicSalary: value }))
                  }
                  min={0}
                  step={100000}
                  placeholder="ປ້ອນເງິນເດືອນພື້ນຖານ"
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                />
              </Form.Group>
            </div>

            {/* Status */}
            <Form.Group>
              <Form.ControlLabel>ສະຖານະ *</Form.ControlLabel>
              <Form.Control
                name="status"
                accepter={SelectPicker}
                data={[
                  { label: "ເປີດໃຊ້ງານ", value: "ACTIVE" },
                  { label: "ປິດໃຊ້ງານ", value: "INACTIVE" },
                ]}
                placeholder="ເລືອກສະຖານະ"
                style={{ width: "100%" }}
                searchable={false}
              />
            </Form.Group>

            {/* Notes */}
            <Form.Group>
              <Form.ControlLabel>ໝາຍເຫດ</Form.ControlLabel>
              <Form.Control
                name="notes"
                rows={4}
                placeholder="ປ້ອນໝາຍເຫດ (ຖ້າມີ)"
              />
            </Form.Group>
          </Form>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button
          onClick={() => {
            setFormValue(initialFormValue);
            onClose();
          }}
          appearance="subtle"
        >
          ຍົກເລີກ
        </Button>
        <Button
          onClick={handleSubmit}
          appearance="primary"
          loading={isLoading}
          disabled={isLoading || loadingProvinces}
        >
          {staff ? "ອັບເດດ" : "ສ້າງ"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default StaffForm;
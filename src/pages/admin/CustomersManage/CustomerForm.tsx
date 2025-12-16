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
} from "rsuite";
import { useCustomerStore } from "../../../store/customerStore";
import type { CustomerAttributes } from "../../../types/customer";
import type { ProvinceAttributes, District } from "../../../types/province";

const { StringType, NumberType } = Schema.Types;

interface FormValue {
  customerCode: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: Date | null;
  idCard: string;
  phone: string;
  email: string;
  village: string;
  provinceId: number | null;
  districtId: number | null;
  status: string;
  notes: string;
}

const model = Schema.Model({
  customerCode: StringType()
    .isRequired("ກະລຸນາປ້ອນລະຫັດລູກຄ້າ")
    .minLength(3, "ລະຫັດລູກຄ້າຕ້ອງມີຢ່າງໜ້ອຍ 3 ຕົວອັກສອນ"),
  firstName: StringType()
    .isRequired("ກະລຸນາປ້ອນຊື່")
    .minLength(2, "ຊື່ຕ້ອງມີຢ່າງໜ້ອຍ 2 ຕົວອັກສອນ"),
  lastName: StringType()
    .isRequired("ກະລຸນາປ້ອນນາມສະກຸນ")
    .minLength(2, "ນາມສະກຸນຕ້ອງມີຢ່າງໜ້ອຍ 2 ຕົວອັກສອນ"),
  gender: StringType().isRequired("ກະລຸນາເລືອກເພດ"),
  phone: StringType()
    .isRequired("ກະລຸນາປ້ອນເບີໂທລະສັບ")
    .pattern(/^[0-9]{8,15}$/, "ກະລຸນາປ້ອນເບີໂທທີ່ຖືກຕ້ອງ"),
  email: StringType().isEmail("ກະລຸນາປ້ອນອີເມວທີ່ຖືກຕ້ອງ"),
  village: StringType(),
  districtId: NumberType().isRequired("ກະລຸນາເລືອກເມືອງ"),
  idCard: StringType(),
  status: StringType().isRequired("ກະລຸນາເລືອກສະຖານະ"),
  notes: StringType(),
});

const initialFormValue: FormValue = {
  customerCode: "",
  firstName: "",
  lastName: "",
  gender: "",
  dateOfBirth: null,
  idCard: "",
  phone: "",
  email: "",
  village: "",
  provinceId: null,
  districtId: null,
  status: "ACTIVE",
  notes: "",
};

const CustomerForm = ({
  open,
  onClose,
  customer,
  provinces,
  loadingProvinces,
}: {
  open: boolean;
  onClose: () => void;
  customer: CustomerAttributes | null;
  provinces: ProvinceAttributes[];
  loadingProvinces: boolean;
}) => {
  const formRef = useRef<any>(null);
  const { createCustomer, updateCustomer, isLoading } = useCustomerStore();

  const [formValue, setFormValue] = useState<FormValue>(initialFormValue);

  useEffect(() => {
    if (customer && provinces.length > 0) {
      const province = provinces.find((p) =>
        p.districts?.some((d) => d.districtId === customer.districtId)
      );
      setFormValue({
        customerCode: customer.customerCode,
        firstName: customer.firstName,
        lastName: customer.lastName,
        gender: customer.gender || "",
        dateOfBirth: customer.dateOfBirth
          ? new Date(customer.dateOfBirth)
          : null,
        idCard: customer.idCard || "",
        phone: customer.phone,
        email: customer.email || "",
        village: customer.village || "",
        provinceId: province?.provinceId || null,
        districtId: customer.districtId || null,
        status: customer.status || "ACTIVE",
        notes: customer.notes || "",
      });
    } else if (!customer && open) {
      setFormValue(initialFormValue);
    }
  }, [customer, open, provinces]);

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
      const customerData: any = {
        ...rest,
        districtId,
        dateOfBirth: formValue.dateOfBirth?.toISOString() || undefined,
      };

      if (customer) {
        await updateCustomer(Number(customer.customerId), customerData);
        toaster.push(
          <Message showIcon type="success">
            ອັບເດດລູກຄ້າສຳເລັດແລ້ວ
          </Message>,
          { placement: "topEnd" }
        );
      } else {
        await createCustomer(customerData);
        toaster.push(
          <Message showIcon type="success">
            ສ້າງລູກຄ້າສຳເລັດແລ້ວ
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
            "ບໍ່ສາມາດບັນທຶກລູກຄ້າໄດ້"}
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
        <Modal.Title>{customer ? "ແກ້ໄຂລູກຄ້າ" : "ສ້າງລູກຄ້າໃໝ່"}</Modal.Title>
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
                  <Form.ControlLabel>ລະຫັດລູກຄ້າ *</Form.ControlLabel>
                  <Form.Control
                    name="customerCode"
                    placeholder="ເຊັ່ນ: CUS001"
                  />
                </Form.Group>

                <Form.Group>
                  <Form.ControlLabel>ເລກບັດປະຊາຊົນ</Form.ControlLabel>
                  <Form.Control name="idCard" placeholder="ເລກບັດປະຊາຊົນ" />
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
                  <Form.ControlLabel>ເພດ *</Form.ControlLabel>
                  <Form.Control
                    name="gender"
                    accepter={SelectPicker}
                    data={[
                      { label: "ຊາຍ", value: "MALE" },
                      { label: "ຍິງ", value: "FEMALE" },
                      { label: "ອື່ນໆ", value: "OTHER" },
                    ]}
                    placeholder="ເລືອກເພດ"
                    style={{ width: "100%" }}
                    searchable={false}
                  />
                </Form.Group>

                <Form.Group>
                  <Form.ControlLabel>ວັນເດືອນປີເກີດ</Form.ControlLabel>
                  <DatePicker
                    value={formValue.dateOfBirth}
                    onChange={(date) =>
                      setFormValue((prev) => ({ ...prev, dateOfBirth: date }))
                    }
                    placeholder="ເລືອກວັນເກີດ"
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
          {customer ? "ອັບເດດ" : "ສ້າງ"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CustomerForm;

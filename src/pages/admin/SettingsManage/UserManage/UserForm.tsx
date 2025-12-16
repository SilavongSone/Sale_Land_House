import { useEffect, useState, useRef, useCallback } from "react";
import {
  Modal,
  Form,
  Button,
  Schema,
  SelectPicker,
  Message,
  toaster,
  Grid,
  Row,
  Col,
  Toggle,
} from "rsuite";
import { useUserStore } from "../../../../store/userStore";
import { useAuthStore } from "../../../../store/authStore";
import type { User } from "../../../../types/user";

const { StringType } = Schema.Types;

interface FormValue {
  username: string;
  email: string;
  password: string;
  currentPassword: string;
  role: string;
  types: string;
  status: "ACTIVE" | "INACTIVE";
  inserts: number;
  updates: number;
  deletes: number;
  cancels: number;
}

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

// Schema validation model
const createValidationModel = (isEdit: boolean, isChangingPassword: boolean, isAdmin: boolean) =>
  Schema.Model({
    username: StringType()
      .isRequired("ກະລຸນາປ້ອນຊື່ຜູ້ໃຊ້")
      .minLength(3, "ຊື່ຜູ້ໃຊ້ຕ້ອງມີຢ່າງໜ້ອຍ 3 ຕົວອັກສອນ"),
    email: StringType()
      .isRequired("ກະລຸນາປ້ອນອີເມວ")
      .isEmail("ກະລຸນາປ້ອນອີເມວທີ່ຖືກຕ້ອງ"),
    password: isEdit
      ? StringType().minLength(6, "ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ")
      : StringType()
          .isRequired("ກະລຸນາປ້ອນລະຫັດຜ່ານ")
          .minLength(6, "ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ"),
    currentPassword: isChangingPassword && !isAdmin
      ? StringType().isRequired("ກະລຸນາປ້ອນລະຫັດຜ່ານປັດຈຸບັນ")
      : StringType(),
    role: StringType().isRequired("ກະລຸນາເລືອກບົດບາດ"),
    types: StringType(),
  });

// Initial form state
const INITIAL_FORM_VALUE: FormValue = {
  username: "",
  email: "",
  password: "",
  currentPassword: "",
  role: "",
  types: "",
  status: "ACTIVE",
  inserts: 1,
  updates: 1,
  deletes: 1,
  cancels: 1,
};

const ROLES = [
  { label: "ຜູ້ດູແລລະບົບ", value: "ADMIN" },
  { label: "ຜູ້ຈັດການ", value: "MANAGER" },
  { label: "ພະນັກງານ", value: "STAFF" },
  
];

const UserForm = ({ open, onClose, user }: UserFormProps) => {
  const formRef = useRef<any>(null);
  const { updateUser, createUser, isLoading } = useUserStore();
  const { checkRole } = useAuthStore();

  const [formValue, setFormValue] = useState<FormValue>(INITIAL_FORM_VALUE);
  const [validationModel, setValidationModel] = useState(
    createValidationModel(!!user, false, checkRole("ADMIN"))
  );

  const isAdmin = checkRole("ADMIN");

  // Update validation model when password field changes
  useEffect(() => {
    const isChangingPassword = !!formValue.password;
    setValidationModel(
      createValidationModel(!!user, isChangingPassword, isAdmin)
    );
  }, [user, formValue.password, isAdmin]);

  // Initialize form with user data or reset
  useEffect(() => {
    if (user && open) {
      setFormValue({
        username: user.username,
        email: user.email,
        password: "",
        currentPassword: "",
        role: user.role,
        types: user.types || "",
        status: user.status,
        inserts: user.inserts,
        updates: user.updates,
        deletes: user.deletes,
        cancels: user.cancels,
      });
    } else if (!user && open) {
      setFormValue(INITIAL_FORM_VALUE);
    }
  }, [user, open]);

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

    try {
      const userData: Partial<User> & { currentPassword?: string } = {
        username: formValue.username,
        email: formValue.email,
        role: formValue.role,
        types: formValue.types || null,
        status: formValue.status,
        inserts: formValue.inserts,
        updates: formValue.updates,
        deletes: formValue.deletes,
        cancels: formValue.cancels,
      };

      // Handle password change
      if (formValue.password) {
        userData.password = formValue.password;
        
        // Non-admin users need to provide current password
        if (!isAdmin && user) {
          userData.currentPassword = formValue.currentPassword;
        }
      }

      if (user) {
        await updateUser(user.id, userData);
        toaster.push(
          <Message showIcon type="success">
            ອັບເດດຜູ້ໃຊ້ສຳເລັດແລ້ວ
          </Message>,
          { placement: "topEnd" }
        );
      } else {
        await createUser(userData as any);
        toaster.push(
          <Message showIcon type="success">
            ສ້າງຜູ້ໃຊ້ສຳເລັດແລ້ວ
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
            "ບໍ່ສາມາດບັນທຶກຜູ້ໃຊ້ໄດ້"}
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

  return (
    <Modal open={open} onClose={handleClose} size="md" overflow>
      <Modal.Header>
        <Modal.Title>{user ? "ແກ້ໄຂຜູ້ໃຊ້" : "ສ້າງຜູ້ໃຊ້ໃໝ່"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form
          ref={formRef}
          model={validationModel}
          formValue={formValue}
          onChange={(value: Record<string, any>) => {
            setFormValue((prev) => ({ ...prev, ...value }));
          }}
          fluid
        >
          <div className="w-full">
            <Grid fluid className="m-0">
              {/* Username & Email - 2 Columns */}
              <Row gutter={8} className="mb-4">
                <Col xs={24} sm={12}>
                  <Form.Group>
                    <Form.ControlLabel>ຊື່ຜູ້ໃຊ້ *</Form.ControlLabel>
                    <Form.Control
                      name="username"
                      placeholder="ປ້ອນຊື່ຜູ້ໃຊ້"
                    />
                  </Form.Group>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Group>
                    <Form.ControlLabel>ອີເມວ *</Form.ControlLabel>
                    <Form.Control
                      name="email"
                      type="email"
                      placeholder="example@email.com"
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Password Section */}
              {user && (
                <Row className="mb-4">
                  <Col xs={24}>
                    <Form.Group>
                      <Form.ControlLabel>
                        ລະຫັດຜ່ານໃໝ່ (ປ່ອຍວ່າງຖ້າບໍ່ຕ້ອງການປ່ຽນ)
                      </Form.ControlLabel>
                      <Form.Control
                        name="password"
                        type="password"
                        placeholder="ປ້ອນລະຫັດໃໝ່ຖ້າຕ້ອງການປ່ຽນ"
                        autoComplete="new-password"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              )}

              {/* Current Password (required when changing password as non-admin) */}
              {user && formValue.password && !isAdmin && (
                <Row className="mb-4">
                  <Col xs={24}>
                    <Form.Group>
                      <Form.ControlLabel>ລະຫັດຜ່ານປັດຈຸບັນ *</Form.ControlLabel>
                      <Form.Control
                        name="currentPassword"
                        type="password"
                        placeholder="ປ້ອນລະຫັດຜ່ານປັດຈຸບັນເພື່ອຢືນຢັນ"
                        autoComplete="current-password"
                      />
                      <Form.HelpText>
                        ຕ້ອງໃຊ້ລະຫັດປັດຈຸບັນເພື່ອຢືນຢັນການປ່ຽນແປງ
                      </Form.HelpText>
                    </Form.Group>
                  </Col>
                </Row>
              )}

              {/* Password for new user */}
              {!user && (
                <Row className="mb-4">
                  <Col xs={24}>
                    <Form.Group>
                      <Form.ControlLabel>ລະຫັດຜ່ານ *</Form.ControlLabel>
                      <Form.Control
                        name="password"
                        type="password"
                        placeholder="ປ້ອນລະຫັດຜ່ານ"
                        autoComplete="new-password"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              )}

              {/* Role & Types - 2 Columns */}
              <Row gutter={8} className="mb-4">
                <Col xs={24} sm={12}>
                  <Form.Group>
                    <Form.ControlLabel>ບົດບາດ *</Form.ControlLabel>
                    <Form.Control
                      name="role"
                      accepter={SelectPicker}
                      data={ROLES}
                      placeholder="ເລືອກບົດບາດ"
                      block
                      disabled={!isAdmin}
                    />
                    {!isAdmin && (
                      <Form.HelpText>ມີແຕ່ Admin ເທົ່ານັ້ນທີ່ສາມາດປ່ຽນບົດບາດໄດ້</Form.HelpText>
                    )}
                  </Form.Group>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Group>
                    <Form.ControlLabel>ປະເພດ</Form.ControlLabel>
                    <Form.Control name="types" placeholder="ປ້ອນປະເພດ (ຖ້າມີ)" />
                  </Form.Group>
                </Col>
              </Row>

              {/* Permissions - 4 Columns (Admin only) */}
              {isAdmin && (
                <>
                  <Row className="mb-4">
                    <Col xs={24}>
                      <div className="mb-2">
                        <label className="font-medium text-sm">ສິດການນຳໃຊ້</label>
                      </div>
                    </Col>
                  </Row>

                  <Row gutter={8} className="mb-4">
                    <Col xs={12} sm={6}>
                      <Form.Group>
                        <div className="flex items-center justify-between p-3 border rounded">
                          <span className="text-sm">ເພີ່ມຂໍ້ມູນ</span>
                          <Toggle
                            checked={formValue.inserts === 1}
                            onChange={(checked) =>
                              setFormValue((prev) => ({
                                ...prev,
                                inserts: checked ? 1 : 0,
                              }))
                            }
                          />
                        </div>
                      </Form.Group>
                    </Col>

                    <Col xs={12} sm={6}>
                      <Form.Group>
                        <div className="flex items-center justify-between p-3 border rounded">
                          <span className="text-sm">ແກ້ໄຂຂໍ້ມູນ</span>
                          <Toggle
                            checked={formValue.updates === 1}
                            onChange={(checked) =>
                              setFormValue((prev) => ({
                                ...prev,
                                updates: checked ? 1 : 0,
                              }))
                            }
                          />
                        </div>
                      </Form.Group>
                    </Col>

                    <Col xs={12} sm={6}>
                      <Form.Group>
                        <div className="flex items-center justify-between p-3 border rounded">
                          <span className="text-sm">ລົບຂໍ້ມູນ</span>
                          <Toggle
                            checked={formValue.deletes === 1}
                            onChange={(checked) =>
                              setFormValue((prev) => ({
                                ...prev,
                                deletes: checked ? 1 : 0,
                              }))
                            }
                          />
                        </div>
                      </Form.Group>
                    </Col>

                    <Col xs={12} sm={6}>
                      <Form.Group>
                        <div className="flex items-center justify-between p-3 border rounded">
                          <span className="text-sm">ຍົກເລີກ</span>
                          <Toggle
                            checked={formValue.cancels === 1}
                            onChange={(checked) =>
                              setFormValue((prev) => ({
                                ...prev,
                                cancels: checked ? 1 : 0,
                              }))
                            }
                          />
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>
                </>
              )}

              {/* Status Toggle - Full Width (Admin only) */}
              {isAdmin && (
                <Row className="mb-0">
                  <Col xs={24}>
                    <Form.Group>
                      <div className="flex items-center justify-between p-3 border rounded bg-gray-50">
                        <div>
                          <div className="font-medium">ສະຖານະ</div>
                          <div className="text-xs text-gray-500">
                            {formValue.status === "ACTIVE"
                              ? "ເປີດນຳໃຊ້"
                              : "ປິດນຳໃຊ້"}
                          </div>
                        </div>
                        <Toggle
                          size="lg"
                          checked={formValue.status === "ACTIVE"}
                          onChange={(checked) =>
                            setFormValue((prev) => ({
                              ...prev,
                              status: checked ? "ACTIVE" : "INACTIVE",
                            }))
                          }
                        />
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
              )}
            </Grid>
          </div>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button onClick={handleClose} appearance="subtle">
          ຍົກເລີກ
        </Button>
        <Button
          onClick={handleSubmit}
          appearance="primary"
          loading={isLoading}
          disabled={isLoading}
        >
          {user ? "ອັບເດດ" : "ສ້າງ"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UserForm;
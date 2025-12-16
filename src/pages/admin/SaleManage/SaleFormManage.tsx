// import { useEffect, useState } from "react";
// import {
//   Modal,
//   Button,
//   Form,
//   Input,
//   SelectPicker,
//   InputNumber,
//   Grid,
//   Row,
//   Col,
//   Divider,
//   Message,
//   DatePicker,
// } from "rsuite";
// import { Save } from "lucide-react";
// import type { Sale, PropertyType } from "../../../types/sale";

// interface SaleFormManageProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSubmit: (data: any) => Promise<void>;
//   editingSale?: Sale | null;
// }

// const SaleFormManage = ({
//   isOpen,
//   onClose,
//   onSubmit,
//   editingSale,
// }: SaleFormManageProps) => {
//   const [formData, setFormData] = useState({
//     saleCode: "",
//     propertyType: "LAND" as PropertyType,
//     saleDate: new Date(),
//     contractNumber: "",
//     totalPrice: 0,
//     discountAmount: 0,
//     finalPrice: 0,
//     downPayment: 0,
//     loanAmount: 0,
//     installmentMonths: 0,
//     monthlyPayment: 0,
//     interestRate: 0,
//     saleStatus: "DRAFT",
//     paymentStatus: "PENDING",
//     notes: "",
//   });

//   const [validationError, setValidationError] = useState<string>("");

//   // Load editing sale data or reset form
//   useEffect(() => {
//     if (isOpen) {
//       if (editingSale) {
//         setFormData({
//           saleCode: editingSale.saleCode,
//           propertyType: editingSale.propertyType,
//           saleDate: new Date(editingSale.saleDate),
//           contractNumber: editingSale.contractNumber || "",
//           totalPrice: editingSale.totalPrice,
//           discountAmount: editingSale.discountAmount || 0,
//           finalPrice: editingSale.finalPrice,
//           downPayment: editingSale.downPayment || 0,
//           loanAmount: editingSale.loanAmount || 0,
//           installmentMonths: editingSale.installmentMonths || 0,
//           monthlyPayment: editingSale.monthlyPayment || 0,
//           interestRate: editingSale.interestRate || 0,
//           saleStatus: editingSale.saleStatus,
//           paymentStatus: editingSale.paymentStatus,
//           notes: editingSale.notes || "",
//         });
//       } else {
//         setFormData({
//           saleCode: "",
//           propertyType: "LAND",
//           saleDate: new Date(),
//           contractNumber: "",
//           totalPrice: 0,
//           discountAmount: 0,
//           finalPrice: 0,
//           downPayment: 0,
//           loanAmount: 0,
//           installmentMonths: 0,
//           monthlyPayment: 0,
//           interestRate: 0,
//           saleStatus: "DRAFT",
//           paymentStatus: "PENDING",
//           notes: "",
//         });
//       }
//       setValidationError("");
//     }
//   }, [isOpen, editingSale]);

//   const handleChange = (name: string, value: any) => {
//     setFormData((prev) => {
//       const updated = { ...prev, [name]: value };

//       // Auto-calculate finalPrice
//       if (name === "totalPrice" || name === "discountAmount") {
//         const total = name === "totalPrice" ? value : updated.totalPrice;
//         const discount = name === "discountAmount" ? value : updated.discountAmount;
//         updated.finalPrice = Math.max(0, total - discount);
//       }

//       // Auto-calculate loanAmount
//       if (name === "finalPrice" || name === "downPayment") {
//         const final = name === "finalPrice" ? value : updated.finalPrice;
//         const down = name === "downPayment" ? value : updated.downPayment;
//         updated.loanAmount = Math.max(0, final - down);
//       }

//       // Auto-calculate monthlyPayment
//       if (name === "loanAmount" || name === "installmentMonths" || name === "interestRate") {
//         const loan = name === "loanAmount" ? value : updated.loanAmount;
//         const months = name === "installmentMonths" ? value : updated.installmentMonths;
//         const rate = name === "interestRate" ? value : updated.interestRate;

//         if (months > 0) {
//           if (rate > 0) {
//             // Calculate with interest (using simple interest for this example)
//             const monthlyRate = rate / 100 / 12;
//             const totalWithInterest = loan * (1 + monthlyRate * months);
//             updated.monthlyPayment = totalWithInterest / months;
//           } else {
//             // No interest
//             updated.monthlyPayment = loan / months;
//           }
//         } else {
//           updated.monthlyPayment = 0;
//         }
//       }

//       return updated;
//     });

//     // Clear validation error when user makes changes
//     if (validationError) {
//       setValidationError("");
//     }
//   };

//   const handleSubmit = async () => {
//     // Validation
//     if (!formData.saleCode.trim()) {
//       setValidationError("ກະລຸນາປ້ອນລະຫັດການຂາຍ");
//       return;
//     }
//     if (formData.totalPrice <= 0) {
//       setValidationError("ກະລຸນາປ້ອນລາຄາລວມທີ່ຖືກຕ້ອງ");
//       return;
//     }
//     if (formData.downPayment > formData.finalPrice) {
//       setValidationError("ເງິນດາວບໍ່ສາມາດເກີນລາຄາສຸດທ້າຍ");
//       return;
//     }
//     if (formData.loanAmount > 0 && formData.installmentMonths <= 0) {
//       setValidationError("ກະລຸນາປ້ອນຈຳນວນງວດຜ່ອນຊຳລະ");
//       return;
//     }

//     try {
//       await onSubmit(formData);
//       setValidationError("");
//     } catch (error) {
//       console.error("Error saving sale:", error);
//       setValidationError("ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ");
//     }
//   };

//   // Prepare data for SelectPicker
//   const propertyTypeData = [
//     { label: "ທີ່ດິນ", value: "LAND" },
//     { label: "ບ້ານ", value: "HOUSE" },
//     { label: "ອື່ນໆ", value: "OTHER" },
//   ];

//   const saleStatusData = [
//     { label: "ຮ່າງ", value: "DRAFT" },
//     { label: "ຢືນຢັນແລ້ວ", value: "CONFIRMED" },
//     { label: "ຍົກເລີກ", value: "CANCELLED" },
//   ];

//   const paymentStatusData = [
//     { label: "ລໍຖ້າຊຳລະ", value: "PENDING" },
//     { label: "ຊຳລະແລ້ວ", value: "PAID" },
//     { label: "ເກີນກຳນົດ", value: "OVERDUE" },
//   ];

//   return (
//     <Modal size="lg" open={isOpen} onClose={onClose} overflow>
//       <Modal.Header>
//         <Modal.Title>
//           {editingSale ? "ແກ້ໄຂການຂາຍ" : "ເພີ່ມການຂາຍໃໝ່"}
//         </Modal.Title>
//       </Modal.Header>
//       <Modal.Body>
//         <Form fluid>
//           {/* Validation Error Alert */}
//           {validationError && (
//             <Message showIcon type="error" style={{ marginBottom: 20 }}>
//               {validationError}
//             </Message>
//           )}

//           {/* Basic Information */}
//           <div style={{ marginBottom: 24 }}>
//             <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
//               ຂໍ້ມູນພື້ນຖານ
//             </h3>
//             <Grid fluid>
//               <Row gutter={16}>
//                 <Col xs={24} md={12}>
//                   <Form.Group controlId="saleCode">
//                     <Form.ControlLabel>ລະຫັດການຂາຍ *</Form.ControlLabel>
//                     <Input
//                       value={formData.saleCode}
//                       onChange={(value) => handleChange("saleCode", value)}
//                       placeholder="ເຊັ່ນ: SALE001"
//                     />
//                   </Form.Group>
//                 </Col>

//                 <Col xs={24} md={12}>
//                   <Form.Group controlId="propertyType">
//                     <Form.ControlLabel>ປະເພດຊັບສິນ *</Form.ControlLabel>
//                     <SelectPicker
//                       data={propertyTypeData}
//                       value={formData.propertyType}
//                       onChange={(value) => handleChange("propertyType", value)}
//                       block
//                       cleanable={false}
//                     />
//                   </Form.Group>
//                 </Col>

//                 <Col xs={24} md={12}>
//                   <Form.Group controlId="saleDate">
//                     <Form.ControlLabel>ວັນທີ່ຂາຍ *</Form.ControlLabel>
//                     <DatePicker
//                       value={formData.saleDate}
//                       onChange={(value) => handleChange("saleDate", value)}
//                       block
//                       format="dd/MM/yyyy"
//                       placeholder="ເລືອກວັນທີ່"
//                     />
//                   </Form.Group>
//                 </Col>

//                 <Col xs={24} md={12}>
//                   <Form.Group controlId="contractNumber">
//                     <Form.ControlLabel>ເລກສັນຍາ</Form.ControlLabel>
//                     <Input
//                       value={formData.contractNumber}
//                       onChange={(value) =>
//                         handleChange("contractNumber", value)
//                       }
//                       placeholder="ເລກທີ່ສັນຍາ"
//                     />
//                   </Form.Group>
//                 </Col>

//                 <Col xs={24} md={12}>
//                   <Form.Group controlId="saleStatus">
//                     <Form.ControlLabel>ສະຖານະການຂາຍ *</Form.ControlLabel>
//                     <SelectPicker
//                       data={saleStatusData}
//                       value={formData.saleStatus}
//                       onChange={(value) => handleChange("saleStatus", value)}
//                       block
//                       cleanable={false}
//                     />
//                   </Form.Group>
//                 </Col>

//                 <Col xs={24} md={12}>
//                   <Form.Group controlId="paymentStatus">
//                     <Form.ControlLabel>ສະຖານະຊຳລະ *</Form.ControlLabel>
//                     <SelectPicker
//                       data={paymentStatusData}
//                       value={formData.paymentStatus}
//                       onChange={(value) => handleChange("paymentStatus", value)}
//                       block
//                       cleanable={false}
//                     />
//                   </Form.Group>
//                 </Col>
//               </Row>
//             </Grid>
//           </div>

//           <Divider />

//           {/* Price Information */}
//           <div style={{ marginBottom: 24 }}>
//             <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
//               ຂໍ້ມູນລາຄາ
//             </h3>
//             <Grid fluid>
//               <Row gutter={16}>
//                 <Col xs={24} md={12}>
//                   <Form.Group controlId="totalPrice">
//                     <Form.ControlLabel>ລາຄາລວມ (LAK) *</Form.ControlLabel>
//                     <InputNumber
//                       value={formData.totalPrice}
//                       onChange={(value) => handleChange("totalPrice", value || 0)}
//                       min={0}
//                       step={1000000}
//                       formatter={(value) =>
//                         `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
//                       }
//                       style={{ width: "100%" }}
//                     />
//                   </Form.Group>
//                 </Col>

//                 <Col xs={24} md={12}>
//                   <Form.Group controlId="discountAmount">
//                     <Form.ControlLabel>ສ່ວນຫຼຸດ (LAK)</Form.ControlLabel>
//                     <InputNumber
//                       value={formData.discountAmount}
//                       onChange={(value) =>
//                         handleChange("discountAmount", value || 0)
//                       }
//                       min={0}
//                       step={100000}
//                       formatter={(value) =>
//                         `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
//                       }
//                       style={{ width: "100%" }}
//                     />
//                   </Form.Group>
//                 </Col>

//                 <Col xs={24} md={12}>
//                   <Form.Group controlId="finalPrice">
//                     <Form.ControlLabel>ລາຄາສຸດທ້າຍ (LAK)</Form.ControlLabel>
//                     <InputNumber
//                       value={formData.finalPrice}
//                       onChange={(value) => handleChange("finalPrice", value || 0)}
//                       min={0}
//                       step={1000000}
//                       formatter={(value) =>
//                         `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
//                       }
//                       style={{ width: "100%" }}
//                       readOnly
//                       disabled
//                     />
//                     <Form.HelpText>
//                       ຄຳນວນອັດຕະໂນມັດ: ລາຄາລວມ - ສ່ວນຫຼຸດ
//                     </Form.HelpText>
//                   </Form.Group>
//                 </Col>

//                 <Col xs={24} md={12}>
//                   <Form.Group controlId="downPayment">
//                     <Form.ControlLabel>ເງິນດາວ (LAK)</Form.ControlLabel>
//                     <InputNumber
//                       value={formData.downPayment}
//                       onChange={(value) => handleChange("downPayment", value || 0)}
//                       min={0}
//                       max={formData.finalPrice}
//                       step={500000}
//                       formatter={(value) =>
//                         `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
//                       }
//                       style={{ width: "100%" }}
//                     />
//                   </Form.Group>
//                 </Col>
//               </Row>
//             </Grid>
//           </div>

//           <Divider />

//           {/* Loan & Installment Information */}
//           <div style={{ marginBottom: 24 }}>
//             <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
//               ຂໍ້ມູນການກູ້ ແລະ ຜ່ອນຊຳລະ
//             </h3>
//             <Grid fluid>
//               <Row gutter={16}>
//                 <Col xs={24} md={12}>
//                   <Form.Group controlId="loanAmount">
//                     <Form.ControlLabel>ຍອດກູ້ (LAK)</Form.ControlLabel>
//                     <InputNumber
//                       value={formData.loanAmount}
//                       onChange={(value) => handleChange("loanAmount", value || 0)}
//                       min={0}
//                       step={1000000}
//                       formatter={(value) =>
//                         `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
//                       }
//                       style={{ width: "100%" }}
//                       readOnly
//                       disabled
//                     />
//                     <Form.HelpText>
//                       ຄຳນວນອັດຕະໂນມັດ: ລາຄາສຸດທ້າຍ - ເງິນດາວ
//                     </Form.HelpText>
//                   </Form.Group>
//                 </Col>

//                 <Col xs={24} md={12}>
//                   <Form.Group controlId="interestRate">
//                     <Form.ControlLabel>ອັດຕາດອກເບ້ຍ (% ຕໍ່ປີ)</Form.ControlLabel>
//                     <InputNumber
//                       value={formData.interestRate}
//                       onChange={(value) => handleChange("interestRate", value || 0)}
//                       min={0}
//                       max={100}
//                       step={0.5}
//                       style={{ width: "100%" }}
//                     />
//                     <Form.HelpText>0% ຖ້າບໍ່ມີດອກເບ້ຍ</Form.HelpText>
//                   </Form.Group>
//                 </Col>

//                 <Col xs={24} md={12}>
//                   <Form.Group controlId="installmentMonths">
//                     <Form.ControlLabel>ຈຳນວນງວດ (ເດືອນ)</Form.ControlLabel>
//                     <InputNumber
//                       value={formData.installmentMonths}
//                       onChange={(value) =>
//                         handleChange("installmentMonths", value || 0)
//                       }
//                       min={0}
//                       max={360}
//                       step={1}
//                       style={{ width: "100%" }}
//                     />
//                     <Form.HelpText>ຈຳນວນເດືອນທີ່ຜ່ອນຊຳລະ</Form.HelpText>
//                   </Form.Group>
//                 </Col>

//                 <Col xs={24} md={12}>
//                   <Form.Group controlId="monthlyPayment">
//                     <Form.ControlLabel>
//                       ຈ່າຍຕໍ່ເດືອນ (LAK)
//                     </Form.ControlLabel>
//                     <InputNumber
//                       value={formData.monthlyPayment}
//                       onChange={(value) =>
//                         handleChange("monthlyPayment", value || 0)
//                       }
//                       min={0}
//                       step={100000}
//                       formatter={(value) =>
//                         `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
//                       }
//                       style={{ width: "100%" }}
//                       readOnly
//                       disabled
//                     />
//                     <Form.HelpText>
//                       ຄຳນວນອັດຕະໂນມັດຈາກຍອດກູ້ ແລະ ຈຳນວນງວດ
//                     </Form.HelpText>
//                   </Form.Group>
//                 </Col>
//               </Row>
//             </Grid>
//           </div>

//           <Divider />

//           {/* Notes */}
//           <Form.Group controlId="notes">
//             <Form.ControlLabel>ໝາຍເຫດ</Form.ControlLabel>
//             <Input
//               as="textarea"
//               rows={4}
//               value={formData.notes ?? ""}
//               onChange={(value) => handleChange("notes", value)}
//               placeholder="ໝາຍເຫດ ຫຼື ລາຍລະອຽດອື່ນໆ"
//             />
//           </Form.Group>
//         </Form>
//       </Modal.Body>
//       <Modal.Footer>
//         <Button onClick={handleSubmit} appearance="primary">
//           <Save size={18} style={{ marginRight: 8 }} />
//           {editingSale ? "ບັນທຶກການແກ້ໄຂ" : "ບັນທຶກ"}
//         </Button>
//         <Button onClick={onClose} appearance="subtle">
//           ຍົກເລີກ
//         </Button>
//       </Modal.Footer>
//     </Modal>
//   );
// };

// export default SaleFormManage;
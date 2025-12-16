// import { useState, useEffect } from "react";
// import { Table, Button } from "rsuite";
// import { Pencil, Trash2, Eye } from "lucide-react";
// import type { PropertyType, Sale } from "../../../types/sale";
// import { TableSkeletonLoader } from "../../../components/PlaceholderLoader";

// const { Column, HeaderCell, Cell } = Table;

// interface StatusBadgeProps {
//   status: string;
//   type: "sale" | "payment";
// }

// interface SaleTableManageProps {
//   sales?: Sale[];
//   onView?: (sale: Sale) => void;
//   onEdit?: (sale: Sale) => void;
//   onDelete?: (id: string) => void;
//   loading?: boolean;
//   activePage?: number;
//   limit?: number;
// }

// // Status badge component
// const StatusBadge = ({ status, type }: StatusBadgeProps) => {
//   const saleStatusConfig: Record<string, { color: string; label: string }> = {
//     DRAFT: { color: "bg-blue-100 text-blue-800", label: "ຮ່າງ" },
//     CONFIRMED: { color: "bg-green-100 text-green-800", label: "ຢືນຢັນແລ້ວ" },
//     CANCELLED: { color: "bg-red-100 text-red-800", label: "ຍົກເລີກ" },
//   };

//   const paymentStatusConfig: Record<string, { color: string; label: string }> =
//     {
//       PENDING: { color: "bg-orange-100 text-orange-800", label: "ລໍຖ້າຊຳລະ" },
//       PAID: { color: "bg-green-100 text-green-800", label: "ຊຳລະແລ້ວ" },
//       OVERDUE: { color: "bg-red-100 text-red-800", label: "ເກີນກຳນົດ" },
//     };

//   const config =
//     type === "sale" ? saleStatusConfig[status] : paymentStatusConfig[status];

//   if (!config) return <span>-</span>;

//   return (
//     <span
//       className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${config.color}`}
//     >
//       {config.label}
//     </span>
//   );
// };

// // Format currency
// const formatCurrency = (amount: number | null | undefined): string => {
//   if (amount === null || amount === undefined) return "0 ₭";
//   return (
//     new Intl.NumberFormat("lo-LA", {
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0,
//     }).format(amount) + " ₭"
//   );
// };

// // Format date
// const formatDate = (date: Date | string | null | undefined): string => {
//   if (!date) return "-";
//   try {
//     return new Date(date).toLocaleDateString("lo-LA", {
//       year: "numeric",
//       month: "2-digit",
//       day: "2-digit",
//     });
//   } catch (error) {
//     return "-";
//   }
// };

// // Property type label
// export const getPropertyTypeLabel = (type: PropertyType): string => {
//   const types: Record<PropertyType, string> = {
//     LAND: "ທີ່ດິນ",
//     HOUSE: "ບ້ານ",
//     OTHER: "ອື່ນໆ",
//   };

//   return types[type] || "-";
// };

// const SaleTableManage = ({
//   sales = [],
//   onView,
//   onEdit,
//   onDelete,
//   loading = false,
//   activePage = 1,
//   limit = 10,
// }: SaleTableManageProps) => {
//   const [showSkeleton, setShowSkeleton] = useState(false);

//   useEffect(() => {
//     let timer: NodeJS.Timeout | null = null;

//     if (loading) {
//       // Show skeleton after 300ms delay to avoid flash on fast loads
//       timer = setTimeout(() => {
//         setShowSkeleton(true);
//       }, 300);
//     } else {
//       // Hide skeleton immediately when data loads
//       setShowSkeleton(false);
//     }

//     return () => {
//       if (timer) {
//         clearTimeout(timer);
//       }
//     };
//   }, [loading]);

//   return (
//     <div className="bg-white rounded-lg shadow overflow-hidden relative">
//       <Table
//         data={sales}
//         height={600}
//         bordered
//         cellBordered
//         autoHeight
//         loading={showSkeleton}
//         renderLoading={() => <TableSkeletonLoader />}
//         locale={{
//           emptyMessage: "ບໍ່ມີຂໍ້ມູນການຂາຍ",
//           loading: "ກຳລັງໂຫຼດ...",
//         }}
//       >
//         {/* No Column */}
//         <Column width={60} align="center" fixed>
//           <HeaderCell>No</HeaderCell>
//           <Cell>
//             {(_rowData, rowIndex) => {
//               const index =
//                 rowIndex !== null && rowIndex !== undefined ? rowIndex : 0;
//               return (activePage - 1) * limit + index + 1;
//             }}
//           </Cell>
//         </Column>

//         {/* Sale Code */}
//         <Column width={140}>
//           <HeaderCell>ລະຫັດການຂາຍ</HeaderCell>
//           <Cell dataKey="saleCode" />
//         </Column>

//         {/* ZoneName */}
//         <Column width={120}>
//           <HeaderCell>ໂຊນ</HeaderCell>
//           <Cell>
//             {(rowData: Sale) => (
//               <span className="px-2 py-1 inline-flex text-xs font-semibold rounded-full bg-cyan-100 text-cyan-800">
//                 {rowData.zone?.zoneName ?? "-"}
//               </span>
//             )}
//           </Cell>
//         </Column>

//         {/* Property Type */}
//         <Column width={110}>
//           <HeaderCell>ປະເພດ</HeaderCell>
//           <Cell>
//             {(rowData: Sale) => (
//               <span className="px-2 py-1 inline-flex text-xs font-semibold rounded-full bg-cyan-100 text-cyan-800">
//                 {getPropertyTypeLabel(rowData.propertyType)}
//               </span>
//             )}
//           </Cell>
//         </Column>

//         {/* Sale Date */}
//         <Column width={120}>
//           <HeaderCell>ວັນທີຂາຍ</HeaderCell>
//           <Cell>{(rowData: Sale) => formatDate(rowData.saleDate)}</Cell>
//         </Column>

//         {/* Total Price */}
//         <Column width={140} align="right">
//           <HeaderCell>ລາຄາລວມ</HeaderCell>
//           <Cell>{(rowData: Sale) => formatCurrency(rowData.totalPrice)}</Cell>
//         </Column>

//         {/* Discount */}
//         <Column width={120} align="right">
//           <HeaderCell>ສ່ວນຫຼຸດ</HeaderCell>
//           <Cell>
//             {(rowData: Sale) => formatCurrency(rowData.discountAmount)}
//           </Cell>
//         </Column>

//         {/* Final Price */}
//         <Column width={150} align="right">
//           <HeaderCell>ລາຄາສຸດທ້າຍ</HeaderCell>
//           <Cell>
//             {(rowData: Sale) => (
//               <span className="font-semibold text-green-600">
//                 {formatCurrency(rowData.finalPrice)}
//               </span>
//             )}
//           </Cell>
//         </Column>

//         {/* Down Payment */}
//         <Column width={130} align="right">
//           <HeaderCell>ເງິນດາວ</HeaderCell>
//           <Cell>{(rowData: Sale) => formatCurrency(rowData.downPayment)}</Cell>
//         </Column>

//         {/* Loan Amount */}
//         <Column width={130} align="right">
//           <HeaderCell>ຍອດກູ້</HeaderCell>
//           <Cell>{(rowData: Sale) => formatCurrency(rowData.loanAmount)}</Cell>
//         </Column>

//         {/* Installment Months */}
//         <Column width={100} align="center">
//           <HeaderCell>ຈຳນວນງວດ</HeaderCell>
//           <Cell>{(rowData: Sale) => rowData.installmentMonths ?? 0}</Cell>
//         </Column>

//         {/* Monthly Payment */}
//         <Column width={140} align="right">
//           <HeaderCell>ຈ່າຍຕໍ່ເດືອນ</HeaderCell>
//           <Cell>
//             {(rowData: Sale) => formatCurrency(rowData.monthlyPayment)}
//           </Cell>
//         </Column>

//         {/* Sale Status */}
//         <Column width={130}>
//           <HeaderCell>ສະຖານະການຂາຍ</HeaderCell>
//           <Cell>
//             {(rowData: Sale) => (
//               <StatusBadge status={rowData.saleStatus} type="sale" />
//             )}
//           </Cell>
//         </Column>

//         {/* Payment Status */}
//         <Column width={130}>
//           <HeaderCell>ສະຖານະຊຳລະ</HeaderCell>
//           <Cell>
//             {(rowData: Sale) => (
//               <StatusBadge status={rowData.paymentStatus} type="payment" />
//             )}
//           </Cell>
//         </Column>

//         {/* Actions */}
//         <Column width={140} fixed="right" align="center">
//           <HeaderCell>ຈັດການ</HeaderCell>
//           <Cell>
//             {(rowData: Sale) => (
//               <div className="flex gap-2 justify-center">
//                 {onView && (
//                   <Button
//                     appearance="link"
//                     onClick={() => onView(rowData)}
//                     size="sm"
//                     title="ເບິ່ງລາຍລະອຽດ"
//                   >
//                     <Eye size={16} />
//                   </Button>
//                 )}
//                 {onEdit && (
//                   <Button
//                     appearance="link"
//                     onClick={() => onEdit(rowData)}
//                     size="sm"
//                     title="ແກ້ໄຂ"
//                   >
//                     <Pencil size={16} />
//                   </Button>
//                 )}
//                 {onDelete && (
//                   <Button
//                     appearance="link"
//                     color="red"
//                     onClick={() => onDelete(rowData.id)}
//                     size="sm"
//                     title="ລຶບ"
//                   >
//                     <Trash2 size={16} />
//                   </Button>
//                 )}
//               </div>
//             )}
//           </Cell>
//         </Column>
//       </Table>
//     </div>
//   );
// };

// export default SaleTableManage;

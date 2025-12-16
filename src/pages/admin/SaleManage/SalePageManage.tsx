// import { useState, useEffect } from "react";
// import {
//   Panel,
//   Button,
//   Modal,
//   Message,
//   toaster,
//   Loader,
//   Pagination,
// } from "rsuite";
// import { Plus } from "lucide-react";
// import { useSaleStore } from "../../../store/saleStore";
// import SaleTableManage from "./SaleTableManage";
// import SaleFormManage from "./SaleFormManage";
// import type { Sale } from "../../../types/sale";
// import Filter from "../../../components/FilterCustom";

// const SalePageManage = () => {
//   const [filters, setFilters] = useState<Partial<Sale & { zoneName?: string }>>({});
//   const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
//   const [activePage, setActivePage] = useState(1);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingSale, setEditingSale] = useState<Sale | null>(null);
//   const limit = 10;

//   // Get data and actions from Zustand store
//   const sales = useSaleStore((state) => state.sales);
//   const loading = useSaleStore((state) => state.loading);
//   const fetchSales = useSaleStore((state) => state.fetchSales);
//   const addSale = useSaleStore((state) => state.createSale);
//   const updateSale = useSaleStore((state) => state.updateSale);
//   const deleteSale = useSaleStore((state) => state.deleteSale);

//   // Fetch sales on mount
//   useEffect(() => {
//     fetchSales();
//   }, [fetchSales]);

//   // Filter sales with proper null/undefined handling
//   const filteredSales = sales.filter((sale) => {
//     // Search by sale code
//     if (filters.saleCode) {
//       const matchesCode = sale.saleCode
//         ?.toLowerCase()
//         .includes(filters.saleCode.toLowerCase());
//       if (!matchesCode) return false;
//     }

//     // Search by zoneName (nested in zone object)
//     if (filters.zoneName) {
//       const matchesZoneName = sale.zone?.zoneName
//         ?.toLowerCase()
//         .includes(filters.zoneName.toLowerCase());
//       if (!matchesZoneName) return false;
//     }

//     // Filter by property type
//     if (filters.propertyType && filters.propertyType !== "OTHER") {
//       if (sale.propertyType !== filters.propertyType) return false;
//     }

//     // Filter by sale date
//     if (filters.saleDate) {
//       try {
//         const filterDate = new Date(filters.saleDate).toDateString();
//         const saleDate = new Date(sale.saleDate).toDateString();
//         if (filterDate !== saleDate) return false;
//       } catch (error) {
//         console.error("Date comparison error:", error);
//         return false;
//       }
//     }

//     // Filter by sale status
//     if (filters.saleStatus && filters.saleStatus !== "ALL") {
//       if (sale.saleStatus !== filters.saleStatus) return false;
//     }

//     // Filter by payment status
//     if (filters.paymentStatus && filters.paymentStatus !== "ALL") {
//       if (sale.paymentStatus !== filters.paymentStatus) return false;
//     }

//     return true;
//   });

//   // Reset to page 1 when filtered sales change
//   useEffect(() => {
//     const totalPages = Math.ceil(filteredSales.length / limit);
//     if (activePage > totalPages && totalPages > 0) {
//       setActivePage(1);
//     }
//   }, [filteredSales.length, activePage, limit]);

//   // Paginate filtered sales
//   const paginatedSales = filteredSales.slice(
//     (activePage - 1) * limit,
//     activePage * limit
//   );

//   const handleFilterChange = (newFilters: Partial<Sale & { zoneName?: string }>) => {
//     setFilters(newFilters);
//     setActivePage(1); // Reset to first page when filters change
//   };

//   const openModal = (sale?: Sale) => {
//     setEditingSale(sale || null);
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setEditingSale(null);
//     setIsModalOpen(false);
//   };

//   const handleFormSubmit = async (data: Sale) => {
//     try {
//       if (editingSale) {
//         await updateSale(editingSale.id, data);
//         toaster.push(
//           <Message showIcon type="success">
//             ແກ້ໄຂການຂາຍສຳເລັດ
//           </Message>,
//           { placement: "topEnd", duration: 3000 }
//         );
//       } else {
//         await addSale(data);
//         toaster.push(
//           <Message showIcon type="success">
//             ເພີ່ມການຂາຍສຳເລັດ
//           </Message>,
//           { placement: "topEnd", duration: 3000 }
//         );
//       }
//       closeModal();
//     } catch (error) {
//       console.error("Error saving sale:", error);
//       toaster.push(
//         <Message showIcon type="error">
//           ຜິດພາດໃນການບັນທຶກການຂາຍ
//         </Message>,
//         { placement: "topEnd", duration: 3000 }
//       );
//     }
//   };

//   const handleView = (sale: Sale) => {
//     toaster.push(
//       <Message showIcon type="info">
//         ເບິ່ງລາຍລະອຽດການຂາຍ: {sale.saleCode}
//       </Message>,
//       { placement: "topEnd", duration: 3000 }
//     );
//     // Navigate to detail page or open view modal
//   };

//   const handleEdit = (sale: Sale) => {
//     openModal(sale);
//   };

//   const handleDeleteClick = (id: string) => {
//     setDeleteConfirmId(id);
//   };

//   const handleDeleteConfirm = async () => {
//     if (!deleteConfirmId) return;

//     try {
//       const deletedSale = sales.find((s) => s.id === deleteConfirmId);
//       await deleteSale(deleteConfirmId);

//       toaster.push(
//         <Message showIcon type="success">
//           ລຶບການຂາຍ {deletedSale?.saleCode} ສຳເລັດແລ້ວ
//         </Message>,
//         { placement: "topEnd", duration: 3000 }
//       );
//     } catch (error) {
//       console.error("Error deleting sale:", error);
//       toaster.push(
//         <Message showIcon type="error">
//           ເກີດຂໍ້ຜິດພາດໃນການລຶບ
//         </Message>,
//         { placement: "topEnd", duration: 3000 }
//       );
//     } finally {
//       setDeleteConfirmId(null);
//     }
//   };

//   const handleCreateNew = () => {
//     openModal();
//   };

//   return (
//     <div className="container mx-auto p-6">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-2xl font-bold">ຈັດການການຂາຍ</h2>
//         <Button
//           appearance="primary"
//           onClick={handleCreateNew}
//           className="flex items-center gap-2"
//           startIcon={<Plus size={18} />}
//         >
//           ເພີ່ມການຂາຍໃໝ່
//         </Button>
//       </div>

//       {/* Loading State - Only show on initial load */}
//       {loading && sales.length === 0 ? (
//         <div className="flex justify-center items-center min-h-[400px]">
//           <Loader size="lg" content="ກຳລັງໂຫຼດ..." />
//         </div>
//       ) : (
//         <>
//           <Panel bordered className="bg-white shadow-sm mb-4">
//             <div className="space-y-4">
//               {/* Filters Section */}
//               <Filter<Sale & { zoneName?: string }>
//                 fields={[
//                   { key: "saleCode", label: "ລະຫັດການຂາຍ", type: "text" },
//                   { key: "zoneName", label: "ໂຊນຂາຍ", type: "text" },
//                   {
//                     key: "propertyType",
//                     label: "ປະເພດຊື້ຂາຍ",
//                     type: "select",
//                     options: [
//                       { label: "ທັງໝົດ", value: "ALL" },
//                       { label: "ບ້ານ", value: "HOUSE" },
//                       { label: "ທີ່ດິນ", value: "LAND" },
//                       { label: "ອື່ນໆ", value: "OTHER" },
//                     ],
//                   },
//                   {
//                     key: "saleStatus",
//                     label: "ສະຖານະການຂາຍ",
//                     type: "select",
//                     options: [
//                       { label: "ທັງໝົດ", value: "ALL" },
//                       { label: "ຮ່າງ", value: "DRAFT" },
//                       { label: "ຢືນຢັນແລ້ວ", value: "CONFIRMED" },
//                       { label: "ຍົກເລີກ", value: "CANCELLED" },
//                     ],
//                   },
//                   {
//                     key: "paymentStatus",
//                     label: "ສະຖານະຊຳລະ",
//                     type: "select",
//                     options: [
//                       { label: "ທັງໝົດ", value: "ALL" },
//                       { label: "ລໍຖ້າຊຳລະ", value: "PENDING" },
//                       { label: "ຊຳລະແລ້ວ", value: "PAID" },
//                       { label: "ເກີນກຳນົດ", value: "OVERDUE" },
//                     ],
//                   },
//                   { key: "saleDate", label: "ວັນທີຂາຍ", type: "date" },
//                 ]}
//                 onFilter={handleFilterChange}
//               />
//             </div>
//           </Panel>

//           {/* Sale Table */}
//           <SaleTableManage
//             sales={paginatedSales}
//             onView={handleView}
//             onEdit={handleEdit}
//             onDelete={handleDeleteClick}
//             loading={loading}
//             activePage={activePage}
//             limit={limit}
//           />

//           {/* Pagination */}
//           {filteredSales.length > 0 && (
//             <div className="flex justify-between items-center mt-4">
//               <div className="text-sm text-gray-600">
//                 ສະແດງ {(activePage - 1) * limit + 1} -{" "}
//                 {Math.min(activePage * limit, filteredSales.length)} ຈາກ{" "}
//                 {filteredSales.length} ລາຍການ
//               </div>
//               <Pagination
//                 prev
//                 next
//                 first
//                 last
//                 ellipsis
//                 boundaryLinks
//                 total={filteredSales.length}
//                 limit={limit}
//                 activePage={activePage}
//                 onChangePage={setActivePage}
//                 maxButtons={5}
//               />
//             </div>
//           )}

//           {/* No Results Message */}
//           {filteredSales.length === 0 && sales.length > 0 && (
//             <div className="text-center py-8 text-gray-500">
//               ບໍ່ພົບຂໍ້ມູນທີ່ກົງກັບການຄົ້ນຫາ
//             </div>
//           )}
//         </>
//       )}

//       {/* Sale Form Modal */}
//       <SaleFormManage
//         isOpen={isModalOpen}
//         onClose={closeModal}
//         onSubmit={handleFormSubmit}
//         editingSale={editingSale}
//       />

//       {/* Delete Confirmation Modal */}
//       <Modal
//         open={!!deleteConfirmId}
//         onClose={() => setDeleteConfirmId(null)}
//         size="xs"
//         backdrop="static"
//       >
//         <Modal.Header>
//           <Modal.Title>ຢືນຢັນການລຶບ</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <p>ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບການຂາຍນີ້?</p>
//           <p className="text-sm text-gray-500 mt-2">
//             ການກະທຳນີ້ບໍ່ສາມາດຍົກເລີກໄດ້
//           </p>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button
//             onClick={handleDeleteConfirm}
//             appearance="primary"
//             color="red"
//           >
//             ລຶບ
//           </Button>
//           <Button onClick={() => setDeleteConfirmId(null)} appearance="subtle">
//             ຍົກເລີກ
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default SalePageManage;
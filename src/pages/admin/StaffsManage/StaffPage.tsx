import { useEffect, useState } from "react";
import { Button, Message, toaster, Panel } from "rsuite";
import PlusIcon from "@rsuite/icons/Plus";

import { useStaffStore } from "../../../store/staffStore";
import useProvinceStore from "../../../store/provinceStore";
import StaffForm from "./StaffForm";
import StaffTable from "./StaffTable";
import DeleteConfirmModal from "../../../components/DeleteConFirmModal";
import Pagination from "../../../components/Pagination";
import Limit from "../../../components/Limit";
import SearchFilter from "../../../components/SearchFilter";
import Search from "../../../components/Search";
import type { Staff } from "../../../types/staff";

const POSITIONS = [
  { value: "MANAGER", label: "ຜູ້ຈັດການ" },
  { value: "STAFF", label: "ພະນັກງານ" },
  { value: "TECHNICIAN", label: "ຊ່າງເທັກນິກ" },
  { value: "ACCOUNTANT", label: "ບັນຊີ" },
  { value: "SALES", label: "ພະນັກງານຂາຍ" },
];

const STATUSES = [
  { value: "ACTIVE", label: "ເປີດນຳໃຊ້" },
  { value: "INACTIVE", label: "ປິດນຳໃຊ້" },
];

const StaffPage = () => {
  const {
    staffs,
    pagination,
    isLoading,
    error,
    fetchStaffs,
    clearError,
    selectedStaff,
    setSelectedStaff,
    deleteStaff,
  } = useStaffStore();

  const {
    provinces,
    fetchProvinces,
    loading: loadingProvinces,
  } = useProvinceStore();

  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);
  const [clientSearch, setClientSearch] = useState("");

  // Applied filters (sent to API)
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    orderBy: "createdAt",
    order: "DESC" as "ASC" | "DESC",
    position: "",
    provinceId: "",
    districtId: "",
    status: "",
  });

  // Pending filters (user selections, not applied yet)
  const [pendingFilters, setPendingFilters] = useState({
    position: "",
    provinceId: "",
    districtId: "",
    status: "",
  });

  useEffect(() => {
    if (!provinces.length) fetchProvinces();
  }, [provinces.length]);

  useEffect(() => {
    const { position, provinceId, districtId, status, ...baseParams } = filters;
    const params: any = { ...baseParams };

    if (position) params.position = position;
    if (provinceId) params.provinceId = provinceId;
    if (districtId) params.districtId = districtId;
    if (status) params.status = status;

    fetchStaffs(params);
  }, [filters]);

  useEffect(() => {
    if (error) {
      toaster.push(
        <Message showIcon type="error" closable>
          {error}
        </Message>,
        { placement: "topEnd" }
      );
      clearError();
    }
  }, [error]);

  const handleFilterSelect = (title: string, value: string) => {
    const key =
      title === "ຕຳແໜ່ງ"
        ? "position"
        : title === "ແຂວງ"
        ? "provinceId"
        : title === "ເມືອງ"
        ? "districtId"
        : "status";

    setPendingFilters((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "provinceId" && { districtId: "" }),
    }));
  };

  const handleSearchClick = () => {
    setFilters((prev) => ({ ...prev, ...pendingFilters, page: 1 }));
  };

  const handleClearFilters = () => {
    const empty = {
      position: "",
      provinceId: "",
      districtId: "",
      status: "",
    };
    setPendingFilters(empty);
    setFilters((prev) => ({ ...prev, ...empty, page: 1 }));
  };

  const handleDelete = async () => {
    if (!staffToDelete) return;
    try {
      await deleteStaff(Number(staffToDelete.staffId));
      toaster.push(
        <Message showIcon type="success">
          ລົບພະນັກງານສຳເລັດ
        </Message>,
        { placement: "topEnd" }
      );
      setShowDeleteModal(false);
      setStaffToDelete(null);
    } catch {
      toaster.push(
        <Message showIcon type="error">
          ລົບພະນັກງານບໍ່ສຳເລັດ
        </Message>,
        { placement: "topEnd" }
      );
    }
  };

  const provinceOpts = provinces.map((p) => ({
    value: String(p.provinceId),
    label: p.provinceName,
  }));

  const districtOpts = pendingFilters.provinceId
    ? (
        provinces.find(
          (p) => p.provinceId === Number(pendingFilters.provinceId)
        )?.districts || []
      ).map((d) => ({ value: String(d.districtId), label: d.districtName }))
    : [];

  const filterOpts = [
    {
      title: "ຕຳແໜ່ງ",
      items: POSITIONS.map((p) => p.value),
      labels: Object.fromEntries(POSITIONS.map((p) => [p.value, p.label])),
      type: "input" as const,
    },
    {
      title: "ແຂວງ",
      items: provinceOpts.length ? provinceOpts.map((p) => p.value) : [""],
      labels: provinceOpts.length
        ? Object.fromEntries(provinceOpts.map((p) => [p.value, p.label]))
        : {},
      type: "select" as const,
    },
    {
      title: "ເມືອງ",
      items: districtOpts.length ? districtOpts.map((d) => d.value) : [""],
      labels: districtOpts.length
        ? Object.fromEntries(districtOpts.map((d) => [d.value, d.label]))
        : {},
      type: "select" as const,
    },
    {
      title: "ສະຖານະ",
      items: STATUSES.map((s) => s.value),
      labels: Object.fromEntries(STATUSES.map((s) => [s.value, s.label])),
      type: "input" as const,
    },
  ];

  // Ensure staffs is always an array
  const staffList = Array.isArray(staffs) ? staffs : [];

  // Search
  const filteredStaffs = clientSearch
    ? staffList.filter((s) =>
        [
          s.staffCode,
          s.firstName,
          s.lastName,
          s.phone,
          s.email,
          s.village,
          s.position,
          s.department,
        ].some((f) => f?.toLowerCase().includes(clientSearch.toLowerCase()))
      )
    : staffList;

  const getStaffDisplayName = (staff: Staff) => {
    return `${staff.firstName} ${staff.lastName}`;
  };

  return (
    <div>
      <Panel
        header={
          <div className="flex justify-between items-center">
            <h4 className="text-xl font-semibold">ຈັດການ ພະນັກງານ</h4>
            <Button
              appearance="primary"
              startIcon={<PlusIcon />}
              onClick={() => {
                setSelectedStaff(null);
                setShowForm(true);
              }}
            >
              ສ້າງພະນັກງານໃໝ່
            </Button>
          </div>
        }
      >
        <SearchFilter
          onSearchClick={handleSearchClick}
          filters={filterOpts}
          onFilterSelect={handleFilterSelect}
          onClearFilters={handleClearFilters}
          activeFilters={{
            ຕຳແໜ່ງ: pendingFilters.position,
            ແຂວງ: pendingFilters.provinceId,
            ເມືອງ: pendingFilters.districtId,
            ສະຖານະ: pendingFilters.status,
          }}
          colProps={{
            ຕຳແໜ່ງ: { xs: 12, sm: 6, md: 6, lg: 3 },
            ແຂວງ: { xs: 12, sm: 6, md: 6, lg: 4 },
            ເມືອງ: { xs: 12, sm: 6, md: 6, lg: 4 },
            ສະຖານະ: { xs: 8, sm: 4, md: 4, lg:3 },
          }}
          disabledFilters={{
            ເມືອງ: !pendingFilters.provinceId,
          }}
        />

        <div className="flex justify-between items-center pb-2">
          <Limit
            limit={filters.limit}
            total={pagination?.total || 0}
            onLimitChange={(limit) =>
              setFilters((prev) => ({ ...prev, limit, page: 1 }))
            }
            baseOptions={[10, 25, 50, 100]}
          />
          <Search onSearch={setClientSearch} placeholder="ຄົ້ນຫາໃນຕາຕະລາງ..." />
        </div>

        <StaffTable
          staffs={filteredStaffs}
          loading={isLoading || loadingProvinces}
          onEdit={(s) => {
            setSelectedStaff(s);
            setShowForm(true);
          }}
          onDelete={(s) => {
            setStaffToDelete(s);
            setShowDeleteModal(true);
          }}
          page={filters.page}
          limit={filters.limit}
          onLimitChange={(limit) =>
            setFilters((prev) => ({ ...prev, limit, page: 1 }))
          }
          searchKeyword=""
          onSearchChange={setClientSearch}
          sortColumn={filters.orderBy}
          sortType={filters.order}
          onSort={(col, type) =>
            setFilters((prev) => ({ ...prev, orderBy: col, order: type }))
          }
        />

        {pagination && pagination.total > 0 && (
          <Pagination
            total={pagination.total}
            limit={pagination.limit}
            page={pagination.page}
            onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
          />
        )}
      </Panel>

      <StaffForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedStaff(null);
        }}
        staff={selectedStaff}
        provinces={provinces}
        loadingProvinces={loadingProvinces}
      />

      <DeleteConfirmModal
        open={showDeleteModal}
        itemName={staffToDelete ? getStaffDisplayName(staffToDelete) : ""}
        onClose={() => {
          setShowDeleteModal(false);
          setStaffToDelete(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default StaffPage;

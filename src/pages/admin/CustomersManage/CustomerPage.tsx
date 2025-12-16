import { useEffect, useState } from "react";
import { Button, Message, toaster, Panel } from "rsuite";
import PlusIcon from "@rsuite/icons/Plus";

import { useCustomerStore } from "../../../store/customerStore";
import useProvinceStore from "../../../store/provinceStore";
import CustomerForm from "./CustomerForm";
import CustomerTable from "./CustomerTable";
import DeleteConfirmModal from "../../../components/DeleteConFirmModal";
import Pagination from "../../../components/Pagination";
import Limit from "../../../components/Limit";
import SearchFilter from "../../../components/SearchFilter";
import Search from "../../../components/Search";
import type { CustomerAttributes } from "../../../types/customer";

const GENDERS = [
  { value: "MALE", label: "ຊາຍ" },
  { value: "FEMALE", label: "ຍິງ" },
  { value: "OTHER", label: "ອື່ນໆ" },
];

const STATUSES = [
  { value: "ACTIVE", label: "ເປີດນຳໃຊ້" },
  { value: "INACTIVE", label: "ປິດນຳໃຊ້" },
];

const CustomerPage = () => {
  const {
    customers,
    pagination,
    isLoading,
    error,
    fetchCustomers,
    clearError,
    selectedCustomer,
    setSelectedCustomer,
    deleteCustomer,
  } = useCustomerStore();

  const {
    provinces,
    fetchProvinces,
    loading: loadingProvinces,
  } = useProvinceStore();

  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] =
    useState<CustomerAttributes | null>(null);
  const [clientSearch, setClientSearch] = useState("");

  // Applied filters (sent to API)
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    orderBy: "createdAt",
    order: "DESC" as "ASC" | "DESC",
    gender: "",
    provinceId: "",
    districtId: "",
    status: "",
  });

  // Pending filters (user selections, not applied yet)
  const [pendingFilters, setPendingFilters] = useState({
    gender: "",
    provinceId: "",
    districtId: "",
    status: "",
  });

  useEffect(() => {
    if (!provinces.length) fetchProvinces();
  }, []);

  useEffect(() => {
    const { gender, provinceId, districtId, status, ...baseParams } = filters;
    const params: any = { ...baseParams };

    if (gender) params.gender = gender;
    if (provinceId) params.provinceId = provinceId;
    if (districtId) params.districtId = districtId;
    if (status) params.status = status;

    fetchCustomers(params);
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
      title === "ເພດ"
        ? "gender"
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
      gender: "",
      provinceId: "",
      districtId: "",
      status: "",
    };
    setPendingFilters(empty);
    setFilters((prev) => ({ ...prev, ...empty, page: 1 }));
  };

  const handleDelete = async () => {
    if (!customerToDelete) return;
    try {
      await deleteCustomer(Number(customerToDelete.customerId)); // <-- แก้ตรงนี้
      toaster.push(
        <Message showIcon type="success">
          ລົບລູກຄ້າສຳເລັດ
        </Message>,
        { placement: "topEnd" }
      );
      setShowDeleteModal(false);
      setCustomerToDelete(null);
    } catch {
      toaster.push(
        <Message showIcon type="error">
          ລົບລູກຄ້າບໍ່ສຳເລັດ
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
      title: "ເພດ",
      items: GENDERS.map((g) => g.value),
      labels: Object.fromEntries(GENDERS.map((g) => [g.value, g.label])),
      type: "input" as const,
    },
    {
      title: "ແຂວງ",
      items: provinceOpts.length > 0 ? provinceOpts.map((p) => p.value) : [""], // always show select
      labels:
        provinceOpts.length > 0
          ? Object.fromEntries(provinceOpts.map((p) => [p.value, p.label]))
          : {}, // empty labels
      type: "select" as const,
    },
    {
      title: "ເມືອງ",
      items: districtOpts.length > 0 ? districtOpts.map((d) => d.value) : [""],
      labels:
        districtOpts.length > 0
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

  // Ensure customers is always an array
  const customerList = Array.isArray(customers) ? customers : [];

  // Search
  const filteredCustomers = clientSearch
    ? customerList.filter((c) =>
        [
          c.customerCode,
          c.firstName,
          c.lastName,
          c.phone,
          c.email,
          c.village,
          c.idCard,
        ].some((f) => f?.toLowerCase().includes(clientSearch.toLowerCase()))
      )
    : customerList;

  const getCustomerDisplayName = (customer: CustomerAttributes) => {
    return `${customer.firstName} ${customer.lastName}`;
  };

  return (
    <div>
      <Panel
        header={
          <div className="flex justify-between items-center">
            <h4 className="text-xl font-semibold">ຈັດການ ລູກຄ້າ</h4>
            <Button
              appearance="primary"
              startIcon={<PlusIcon />}
              onClick={() => {
                setSelectedCustomer(null);
                setShowForm(true);
              }}
            >
              ສ້າງລູກຄ້າໃໝ່
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
            ເພດ: pendingFilters.gender,
            ແຂວງ: pendingFilters.provinceId,
            ເມືອງ: pendingFilters.districtId,
            ສະຖານະ: pendingFilters.status,
          }}
          colProps={{
            ແຂວງ: { xs: 12, sm: 6, md: 6, lg: 4 },
            ເມືອງ: { xs: 12, sm: 6, md: 6, lg: 4 },
            ສະຖານະ: { xs: 8, sm: 4, md: 4, lg: 3 },
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

        <CustomerTable
          customers={filteredCustomers}
          loading={isLoading || loadingProvinces}
          onEdit={(c) => {
            setSelectedCustomer(c);
            setShowForm(true);
          }}
          onDelete={(c) => {
            setCustomerToDelete(c);
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

      <CustomerForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedCustomer(null);
        }}
        customer={selectedCustomer}
        provinces={provinces}
        loadingProvinces={loadingProvinces}
      />

      <DeleteConfirmModal
        open={showDeleteModal}
        itemName={
          customerToDelete ? getCustomerDisplayName(customerToDelete) : ""
        }
        onClose={() => {
          setShowDeleteModal(false);
          setCustomerToDelete(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default CustomerPage;

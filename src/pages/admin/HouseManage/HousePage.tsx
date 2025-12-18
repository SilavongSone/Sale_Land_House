import { useEffect, useState, useMemo, useCallback } from "react";
import { Button, Message, toaster, Panel } from "rsuite";
import PlusIcon from "@rsuite/icons/Plus";
import { useHouseStore } from "../../../store/houseStore";
import { useProjectStore } from "../../../store/projectStore";
import { useAreaStore } from "../../../store/areaStore";

import HouseForm from "./HouseForm";
import HouseTable from "./HouseTable";
import DeleteConfirmModal from "../../../components/DeleteConFirmModal";
import Pagination from "../../../components/Pagination";
import Limit from "../../../components/Limit";
import SearchFilter from "../../../components/SearchFilter";
import Search from "../../../components/Search";
import type { House } from "../../../types/house";

// Constants
const STATUSES = [
  { value: "AVAILABLE", label: "ວ່າງ" },
  { value: "SOLD", label: "ຂາຍແລ້ວ" },
  { value: "RESERVED", label: "ຈອງແລ້ວ" },
] as const;

const INITIAL_FILTERS = {
  page: 1,
  limit: 10,
  orderBy: "createdAt",
  order: "DESC" as "ASC" | "DESC",
  zoneId: "",
  status: "",
  projectId: "",
};

const INITIAL_PENDING_FILTERS = {
  projectId: "",
  zoneId: "",
  status: "",
};

const HousePage = () => {
  // Store hooks
  const {
    houses,
    pagination,
    isLoading,
    error,
    fetchHouses,
    clearError,
    selectedHouse,
    setSelectedHouse,
    deleteHouse,
  } = useHouseStore();

  const { projectOptions, fetchProjectOptions } = useProjectStore();
  const { clear: clearAreaData } = useAreaStore();

  // Local state
  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [houseToDelete, setHouseToDelete] = useState<House | null>(null);
  const [clientSearch, setClientSearch] = useState("");
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [pendingFilters, setPendingFilters] = useState(INITIAL_PENDING_FILTERS);

  // ✅ Helper function to refetch current data
  const refetchCurrentData = useCallback(() => {
    const params: Record<string, any> = {
      page: filters.page,
      limit: filters.limit,
      orderBy: filters.orderBy,
      order: filters.order,
    };

    if (filters.zoneId) params.zoneId = filters.zoneId;
    if (filters.status) params.status = filters.status;
    if (filters.projectId) params.projectId = filters.projectId;

    fetchHouses(params);
  }, [filters, fetchHouses]);

  // Fetch initial data
  useEffect(() => {
    fetchProjectOptions();
  }, [fetchProjectOptions]);

  // Fetch houses when filters change
  useEffect(() => {
    refetchCurrentData();
  }, [
    filters.page,
    filters.limit,
    filters.orderBy,
    filters.order,
    filters.zoneId,
    filters.status,
    filters.projectId,
  ]);

  // Handle errors
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
  }, [error, clearError]);

  // Memoized filter options
  const projectOptionsForFilter = useMemo(
    () =>
      (projectOptions || []).map((p: any) => ({
        value: String(p.projectId),
        label: p.projectName,
      })),
    [projectOptions]
  );

  const allZonesFromProjects = useMemo(() => {
    if (!projectOptions) return [];

    return projectOptions.flatMap((project: any) =>
      (project.zones || [])
        .filter((zone: any) => zone.zoneType === "HOUSE")
        .map((zone: any) => ({
          ...zone,
          projectId: project.projectId,
        }))
    );
  }, [projectOptions]);

  const zoneOptions = useMemo(() => {
    const filteredZones = pendingFilters.projectId
      ? allZonesFromProjects.filter(
          (z) => String(z.projectId) === pendingFilters.projectId
        )
      : allZonesFromProjects;

    return filteredZones.map((z) => ({
      value: String(z.zoneId),
      label: z.zoneName,
    }));
  }, [allZonesFromProjects, pendingFilters.projectId]);

  const filterOptions = useMemo(() => {
    const opts = [];

    opts.push({
      title: "ໂຄງການ",
      items: projectOptionsForFilter.map((p) => p.value),
      labels: Object.fromEntries(
        projectOptionsForFilter.map((p) => [p.value, p.label])
      ),
      type: "select" as const,
    });

    opts.push({
      title: "ໂຊນ",
      items: zoneOptions.map((z) => z.value),
      labels: Object.fromEntries(zoneOptions.map((z) => [z.value, z.label])),
      type: "select" as const,
    });

    opts.push({
      title: "ສະຖານະ",
      items: STATUSES.map((s) => s.value),
      labels: Object.fromEntries(STATUSES.map((s) => [s.value, s.label])),
      type: "input" as const,
    });

    return opts;
  }, [projectOptionsForFilter, zoneOptions]);

  // Client-side filtered houses
  const filteredHouses = useMemo(() => {
    if (!clientSearch) return houses;

    const searchLower = clientSearch.toLowerCase();
    return houses.filter((h) =>
      [
        h.houseNumber,
        h.houseType,
        h.description,
        String(h.landArea),
        String(h.builtArea),
      ].some((field) => field?.toLowerCase().includes(searchLower))
    );
  }, [houses, clientSearch]);

  // Handlers
  const handleFilterSelect = useCallback((title: string, value: string) => {
    const keyMap: Record<string, keyof typeof INITIAL_PENDING_FILTERS> = {
      ໂຄງການ: "projectId",
      ໂຊນ: "zoneId",
      ສະຖານະ: "status",
    };
    const key = keyMap[title];
    if (key) {
      setPendingFilters((prev) => {
        if (key === "projectId") {
          return { ...prev, projectId: value, zoneId: "" };
        }
        return { ...prev, [key]: value };
      });
    }
  }, []);

  const handleSearchClick = useCallback(() => {
    setFilters((prev) => ({ ...prev, ...pendingFilters, page: 1 }));
  }, [pendingFilters]);

  const handleClearFilters = useCallback(() => {
    setPendingFilters(INITIAL_PENDING_FILTERS);
    setFilters((prev) => ({ ...prev, ...INITIAL_PENDING_FILTERS, page: 1 }));
  }, []);

  const handleLimitChange = useCallback((limit: number) => {
    setFilters((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const handleSort = useCallback((col: string, type: "ASC" | "DESC") => {
    setFilters((prev) => ({ ...prev, orderBy: col, order: type }));
  }, []);

  const handleAddNew = useCallback(() => {
    setSelectedHouse(null);
    setShowForm(true);
  }, [setSelectedHouse]);

  const handleEdit = useCallback(
    (house: House) => {
      setSelectedHouse(house);
      setShowForm(true);
    },
    [setSelectedHouse]
  );

  const handleDeleteRequest = useCallback((house: House) => {
    setHouseToDelete(house);
    setShowDeleteModal(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!houseToDelete) return;

    try {
      await deleteHouse(houseToDelete.id);
      clearAreaData(); // ✅ clear cache
      toaster.push(
        <Message showIcon type="success">
          ລົບສຳເລັດ
        </Message>,
        { placement: "topEnd" }
      );
      setShowDeleteModal(false);
      setHouseToDelete(null);

      // ✅ Refetch data after successful delete
      refetchCurrentData();
    } catch {
      toaster.push(
        <Message showIcon type="error">
          ລົບບໍ່ສຳເລັດ
        </Message>,
        { placement: "topEnd" }
      );
    }
  }, [houseToDelete, deleteHouse, clearAreaData, refetchCurrentData]);

  const handleCloseForm = useCallback(() => {
    setShowForm(false);
    setSelectedHouse(null);

    // ✅ Refetch data after form closes (after save)
    refetchCurrentData();
  }, [setSelectedHouse, refetchCurrentData]);

  const handleCloseDeleteModal = useCallback(() => {
    setShowDeleteModal(false);
    setHouseToDelete(null);
  }, []);

  return (
    <div>
      <Panel
        header={
          <div className="flex justify-between items-center">
            <h4 className="text-xl font-semibold">ຈັດການ ເຮືອນ</h4>
            <Button
              appearance="primary"
              startIcon={<PlusIcon />}
              onClick={handleAddNew}
            >
              ເພີ່ມເຮືອນໃໝ່
            </Button>
          </div>
        }
      >
        <SearchFilter
          onSearchClick={handleSearchClick}
          filters={filterOptions}
          onFilterSelect={handleFilterSelect}
          onClearFilters={handleClearFilters}
          colProps={{
            ໂຄງການ: { xs: 14, sm: 8, md: 10, lg: 5 },
            ໂຊນ: { xs: 7, sm: 6, md: 6, lg: 4 },
            ສະຖານະ: { xs: 6, sm: 4, md: 5, lg: 3 },
          }}
          activeFilters={{
            ໂຄງການ: pendingFilters.projectId,
            ໂຊນ: pendingFilters.zoneId,
            ສະຖານະ: pendingFilters.status,
          }}
          disabledFilters={{
            ໂຊນ: !pendingFilters.projectId,
          }}
        />
        <div className="flex justify-between items-center pb-2">
          <Limit
            limit={filters.limit}
            total={pagination?.total || 0}
            onLimitChange={handleLimitChange}
            baseOptions={[10, 25, 50, 100]}
          />
          <Search onSearch={setClientSearch} placeholder="ຄົ້ນຫາ..." />
        </div>
        <HouseTable
          houses={filteredHouses}
          projects={projectOptions || []}
          loading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
          page={filters.page}
          limit={filters.limit}
          onLimitChange={handleLimitChange}
          searchKeyword=""
          onSearchChange={setClientSearch}
          sortColumn={filters.orderBy}
          sortType={filters.order}
          onSort={handleSort}
        />
        {pagination && pagination.total > 0 && (
          <Pagination
            total={pagination.total}
            limit={pagination.limit}
            page={pagination.page}
            onPageChange={handlePageChange}
          />
        )}
      </Panel>

      <HouseForm
        open={showForm}
        onClose={handleCloseForm}
        house={selectedHouse}
        projects={projectOptions || []}
      />

      <DeleteConfirmModal
        open={showDeleteModal}
        itemName={houseToDelete?.houseNumber || ""}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default HousePage;
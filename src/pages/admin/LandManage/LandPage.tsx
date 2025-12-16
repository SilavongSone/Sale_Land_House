import { useEffect, useState, useMemo, useCallback } from "react";
import { Button, Message, toaster, Panel } from "rsuite";
import PlusIcon from "@rsuite/icons/Plus";
import { useLandPlotStore } from "../../../store/landPlotStore";
import { useHouseStore } from "../../../store/houseStore";
import { useProjectStore } from "../../../store/projectStore";

import LandPlotForm from "./LandForm";
import LandPlotTable from "./LandTable";
import DeleteConfirmModal from "../../../components/DeleteConFirmModal";
import Pagination from "../../../components/Pagination";
import Limit from "../../../components/Limit";
import SearchFilter from "../../../components/SearchFilter";
import Search from "../../../components/Search";
import type { LandPlot } from "../../../types/landPlot";

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

const LandPlotPage = () => {
  // Store hooks
  const {
    landPlots,
    pagination,
    isLoading,
    error,
    fetchLandPlots,
    clearError,
    selectedLandPlot,
    setSelectedLandPlot,
    deleteLandPlot,
  } = useLandPlotStore();

  const { houses, fetchHouses } = useHouseStore();
  const { projectOptions, fetchProjectOptions } = useProjectStore();

  // Local state
  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [landPlotToDelete, setLandPlotToDelete] = useState<LandPlot | null>(
    null
  );
  const [clientSearch, setClientSearch] = useState("");
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [pendingFilters, setPendingFilters] = useState(INITIAL_PENDING_FILTERS);

  // Fetch initial data
  useEffect(() => {
    fetchHouses();
    fetchProjectOptions();
  }, []);

  // Fetch land plots when filters change
  useEffect(() => {
    const params: Record<string, any> = {
      page: filters.page,
      limit: filters.limit,
      orderBy: filters.orderBy,
      order: filters.order,
    };

    if (filters.zoneId) params.zoneId = filters.zoneId;
    if (filters.status) params.status = filters.status;
    if (filters.projectId) params.projectId = filters.projectId;

    fetchLandPlots(params);
  }, [filters, fetchLandPlots]);

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
        .filter((zone: any) => zone.zoneType === "LAND") // Only LAND type zones
        .map((zone: any) => ({
          ...zone,
          projectId: project.projectId,
        }))
    );
  }, [projectOptions]);
  
  const zoneOptions = useMemo(() => {
    // Filter zones based on selected project (already filtered by LAND type)
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

  // Client-side filtered land plots
  const filteredLandPlots = useMemo(() => {
    if (!clientSearch) return landPlots;

    const searchLower = clientSearch.toLowerCase();
    return landPlots.filter((lp) =>
      [lp.plotNumber, lp.landTitleNumber, lp.notes, String(lp.landArea)].some(
        (field) => field?.toLowerCase().includes(searchLower)
      )
    );
  }, [landPlots, clientSearch]);

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
        // If changing project, clear zone selection
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
    setSelectedLandPlot(null);
    setShowForm(true);
  }, [setSelectedLandPlot]);

  const handleEdit = useCallback(
    (landPlot: LandPlot) => {
      setSelectedLandPlot(landPlot);
      setShowForm(true);
    },
    [setSelectedLandPlot]
  );

  const handleDeleteRequest = useCallback((landPlot: LandPlot) => {
    setLandPlotToDelete(landPlot);
    setShowDeleteModal(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!landPlotToDelete) return;

    try {
      await deleteLandPlot(landPlotToDelete.landPlotId);
      toaster.push(
        <Message showIcon type="success">
          ລົບສຳເລັດ
        </Message>,
        { placement: "topEnd" }
      );
      setShowDeleteModal(false);
      setLandPlotToDelete(null);
    } catch {
      toaster.push(
        <Message showIcon type="error">
          ລົບບໍ່ສຳເລັດ
        </Message>,
        { placement: "topEnd" }
      );
    }
  }, [landPlotToDelete, deleteLandPlot]);

  const handleCloseForm = useCallback(() => {
    setShowForm(false);
    setSelectedLandPlot(null);
  }, [setSelectedLandPlot]);

  const handleCloseDeleteModal = useCallback(() => {
    setShowDeleteModal(false);
    setLandPlotToDelete(null);
  }, []);

  return (
    <div>
      <Panel
        header={
          <div className="flex justify-between items-center">
            <h4 className="text-xl font-semibold">ຈັດການ ແປ່ນດິນ</h4>
            <Button
              appearance="primary"
              startIcon={<PlusIcon />}
              onClick={handleAddNew}
            >
              ເພີ່ມແປ່ນດິນໃໝ່
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
        <LandPlotTable
          landPlots={filteredLandPlots}
          projects={projectOptions || []} // Remove zones prop
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

      <LandPlotForm
        open={showForm}
        onClose={handleCloseForm}
        onSuccess={handleCloseForm}
        landPlot={selectedLandPlot}
        houses={houses}
        landPlots={landPlots}
        projects={projectOptions || []}
      />

      <DeleteConfirmModal
        open={showDeleteModal}
        itemName={landPlotToDelete?.plotNumber || ""}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default LandPlotPage;

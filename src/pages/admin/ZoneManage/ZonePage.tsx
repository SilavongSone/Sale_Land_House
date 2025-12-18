import { useEffect, useState } from "react";
import { Button, Message, toaster, Panel } from "rsuite";
import PlusIcon from "@rsuite/icons/Plus";

import { useZoneStore } from "../../../store/zoneStore";
import { useProjectStore } from "../../../store/projectStore";
import { useAreaStore } from "../../../store/areaStore";
import ZoneForm from "./ZoneForm";
import ZoneTable from "./ZoneTable";
import DeleteConfirmModal from "../../../components/DeleteConFirmModal";
import Pagination from "../../../components/Pagination";
import Limit from "../../../components/Limit";
import SearchFilter from "../../../components/SearchFilter";
import Search from "../../../components/Search";
import type { Zone } from "../../../types/zone";

const STATUSES = [
  { value: "ACTIVE", label: "ເປີດນຳໃຊ້" },
  { value: "INACTIVE", label: "ປິດນຳໃຊ້" },
];

const ZonePage = () => {
  const {
    zones,
    pagination,
    isLoading,
    error,
    fetchZones,
    clearError,
    selectedZone,
    setSelectedZone,
    deleteZone,
  } = useZoneStore();

  const { clear: clearAreaData } = useAreaStore();

  const {
    projectOptions,
    fetchProjectOptions,
    isLoading: loadingProjects,
  } = useProjectStore();

  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [zoneToDelete, setZoneToDelete] = useState<Zone | null>(null);
  const [clientSearch, setClientSearch] = useState("");

  // Applied filters (sent to API)
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    orderBy: "createdAt",
    order: "DESC" as "ASC" | "DESC",
    projectId: "",
    status: "",
  });

  // Pending filters (user selections, not applied yet)
  const [pendingFilters, setPendingFilters] = useState({
    projectId: "",
    status: "",
  });

  useEffect(() => {
    fetchProjectOptions();
  }, []);

  useEffect(() => {
    const { projectId, status, ...baseParams } = filters;
    const params: any = { ...baseParams };

    if (projectId) params.projectId = projectId;
    if (status) params.status = status;

    fetchZones(params);
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
    const key = title === "ໂຄງການ" ? "projectId" : "status";
    setPendingFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearchClick = () => {
    setFilters((prev) => ({ ...prev, ...pendingFilters, page: 1 }));
  };

  const handleClearFilters = () => {
    const empty = { projectId: "", status: "" };
    setPendingFilters(empty);
    setFilters((prev) => ({ ...prev, ...empty, page: 1 }));
  };

  const handleDelete = async () => {
    if (!zoneToDelete) return;
    try {
      await deleteZone(zoneToDelete.zoneId);
      clearAreaData(); // ✅ clear cache
      toaster.push(
        <Message showIcon type="success">
          ລົບໂຊນສຳເລັດ
        </Message>,
        { placement: "topEnd" }
      );
      setShowDeleteModal(false);
      setZoneToDelete(null);
    } catch (error: any) {
      // error handling
    }
  };

  // Use projectOptions instead of projects
  const projectOpts = (projectOptions || []).map((p: any) => ({
    value: String(p.projectId),
    label: p.projectName,
  }));

  const filterOpts = [
    {
      title: "ໂຄງການ",
      items: projectOpts.length > 0 ? projectOpts.map((p) => p.value) : [""],
      labels:
        projectOpts.length > 0
          ? Object.fromEntries(projectOpts.map((p) => [p.value, p.label]))
          : { "": "ບໍ່ມີໂຄງການ" },
      type: "select" as const,
    },
    {
      title: "ສະຖານະ",
      items: STATUSES.map((s) => s.value),
      labels: Object.fromEntries(STATUSES.map((s) => [s.value, s.label])),
      type: "input" as const,
    },
  ];
  // console.log("filterOpts",filterOpts );

  const filteredZones = clientSearch
    ? zones.filter((z) =>
        [
          z.zoneName,
          z.zoneCode,
          z.description,
          z.zoneType,
          z.project?.projectName,
        ].some((f) =>
          String(f ?? "")
            .toLowerCase()
            .includes(clientSearch.toLowerCase())
        )
      )
    : zones;

  return (
    <div>
      <Panel
        header={
          <div className="flex justify-between items-center">
            <h4 className="text-xl font-semibold">ຈັດການ ໂຊນ</h4>
            <Button
              appearance="primary"
              startIcon={<PlusIcon />}
              onClick={() => {
                setSelectedZone(null);
                setShowForm(true);
              }}
              disabled={loadingProjects}
            >
              ສ້າງໂຊນໃໝ່
            </Button>
          </div>
        }
      >
        <SearchFilter
          onSearchClick={handleSearchClick}
          filters={filterOpts}
          onFilterSelect={handleFilterSelect}
          onClearFilters={handleClearFilters}
          colProps={{
            ໂຄງການ: { xs: 10, sm: 6, md: 6, lg: 4 },
            ສະຖານະ: { xs: 7, sm: 4, md: 4, lg: 3 },
          }}
          activeFilters={{
            ໂຄງການ: pendingFilters.projectId,
            ສະຖານະ: pendingFilters.status,
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
          <Search onSearch={setClientSearch} placeholder="ຄົ້ນຫາ..." />
        </div>

        <ZoneTable
          zones={filteredZones}
          loading={isLoading || loadingProjects}
          onEdit={(z) => {
            setSelectedZone(z);
            setShowForm(true);
          }}
          onDelete={(z) => {
            setZoneToDelete(z);
            setShowDeleteModal(true);
          }}
          page={filters.page}
          limit={filters.limit}
          onLimitChange={(limit) =>
            setFilters((prev) => ({ ...prev, limit, page: 1 }))
          }
          searchKeyword=""
          onSearchChange={() => {}}
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

      <ZoneForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedZone(null);
        }}
        zone={selectedZone}
      />

      <DeleteConfirmModal
        open={showDeleteModal}
        itemName={zoneToDelete?.zoneName || ""}
        onClose={() => {
          setShowDeleteModal(false);
          setZoneToDelete(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default ZonePage;

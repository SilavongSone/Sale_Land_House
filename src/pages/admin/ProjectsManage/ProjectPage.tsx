import { useEffect, useState } from "react";
import { Button, Message, toaster, Panel } from "rsuite";
import PlusIcon from "@rsuite/icons/Plus";

import { useProjectStore } from "../../../store/projectStore";
import useProvinceStore from "../../../store/provinceStore";
import ProjectForm from "./ProjectForm";
import ProjectTable from "./ProjectTable";
import DeleteConfirmModal from "../../../components/DeleteConFirmModal";
import Pagination from "../../../components/Pagination";
import Limit from "../../../components/Limit";
import SearchFilter from "../../../components/SearchFilter";
import Search from "../../../components/Search";
import type { Project } from "../../../types/project";

const STATUSES = [
  { value: "ACTIVE", label: "ເປີດນຳໃຊ້" },
  { value: "INACTIVE", label: "ປິດນຳໃຊ້" },
];

const ProjectPage = () => {
  const {
    projects,
    pagination,
    isLoading,
    error,
    fetchProjects,
    clearError,
    selectedProject,
    setSelectedProject,
    deleteProject,
  } = useProjectStore();

  const {
    provinces,
    fetchProvinces,
    loading: loadingProvinces,
  } = useProvinceStore();

  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [clientSearch, setClientSearch] = useState("");

  // Applied filters (sent to API)
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    orderBy: "createdAt",
    order: "DESC" as "ASC" | "DESC",
    provinceId: "",
    districtId: "",
    status: "",
  });

  // Pending filters (user selections, not applied yet)
  const [pendingFilters, setPendingFilters] = useState({
    provinceId: "",
    districtId: "",
    status: "",
  });

  useEffect(() => {
    if (!provinces.length) fetchProvinces();
  }, [provinces.length]);

  useEffect(() => {
    const { provinceId, districtId, status, ...baseParams } = filters;
    const params: any = { ...baseParams };

    if (provinceId) params.provinceId = provinceId;
    if (districtId) params.districtId = districtId;
    if (status) params.status = status;

    fetchProjects(params);
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
      title === "ແຂວງ"
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
      provinceId: "",
      districtId: "",
      status: "",
    };
    setPendingFilters(empty);
    setFilters((prev) => ({ ...prev, ...empty, page: 1 }));
  };

  const handleDelete = async () => {
    if (!projectToDelete) return;
    try {
      await deleteProject(projectToDelete.projectId);
      toaster.push(
        <Message showIcon type="success">
          ລົບໂຄງການສຳເລັດ
        </Message>,
        { placement: "topEnd" }
      );
      setShowDeleteModal(false);
      setProjectToDelete(null);
    } catch {
      toaster.push(
        <Message showIcon type="error">
          ລົບໂຄງການບໍ່ສຳເລັດ
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
      title: "ແຂວງ",
      items: provinceOpts.map((p) => p.value),
      labels: Object.fromEntries(
        provinceOpts.map((p) => [p.value, p.label])
      ),
      type: "select" as const,
    },
    {
      title: "ເມືອງ",
      items: districtOpts.map((d) => d.value),
      labels: Object.fromEntries(
        districtOpts.map((d) => [d.value, d.label])
      ),
      type: "select" as const,
    },
    {
      title: "ສະຖານະ",
      items: STATUSES.map((s) => s.value),
      labels: Object.fromEntries(STATUSES.map((s) => [s.value, s.label])),
      type: "input" as const,
    },
  ];

  const filteredProjects = clientSearch
    ? projects.filter((p) =>
        [p.projectName, p.landOwnerName, p.description, p.village].some((f) =>
          f?.toLowerCase().includes(clientSearch.toLowerCase())
        )
      )
    : projects;

  // console.log(filteredProjects);

  return (
    <div>
      <Panel
        header={
          <div className="flex justify-between items-center">
            <h4 className="text-xl font-semibold">ຈັດການ ໂຄງການ</h4>
            <Button
              appearance="primary"
              startIcon={<PlusIcon />}
              onClick={() => {
                setSelectedProject(null);
                setShowForm(true);
              }}
            >
              ສ້າງໂຄງການໃໝ່
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
          <Search onSearch={setClientSearch} />
        </div>

        <ProjectTable
          projects={filteredProjects}
          loading={isLoading || loadingProvinces}
          onEdit={(p) => {
            setSelectedProject(p);
            setShowForm(true);
          }}
          onDelete={(p) => {
            setProjectToDelete(p);
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

      <ProjectForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedProject(null);
        }}
        project={selectedProject}
        provinces={provinces}
        loadingProvinces={loadingProvinces}
      />

      <DeleteConfirmModal
        open={showDeleteModal}
        itemName={projectToDelete?.projectName || ""}
        onClose={() => {
          setShowDeleteModal(false);
          setProjectToDelete(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default ProjectPage;
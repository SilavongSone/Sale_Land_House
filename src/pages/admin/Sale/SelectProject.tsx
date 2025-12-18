import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useProjectStore } from "../../../store/projectStore";
import { Building2, MapPin, Layers } from "lucide-react";
import {
  Panel,
  Loader,
  Message,
  Pagination,
  Grid,
  Row,
  Col,
  Button,
} from "rsuite";

interface ProjectSelectProps {
  selectedProject: any;
  onSelectProject: (project: any) => void;
}

const ProjectSelect: React.FC<ProjectSelectProps> = ({
  selectedProject,
  onSelectProject,
}) => {
  const {
    projects,
    fetchProjects,
    isLoading: projectsLoading,
    error: projectsError,
  } = useProjectStore();

  const [localError, setLocalError] = useState<string | null>(null);
  const [projectPage, setProjectPage] = useState(1);
  const limit = 8;

  // Load projects
  const loadProjects = useCallback(async () => {
    try {
      setLocalError(null);
      await fetchProjects({ status: "ACTIVE" });
    } catch (err: any) {
      setLocalError(err.message || "ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນໂຄງການ");
    }
  }, [fetchProjects]);

  useEffect(() => {
    if (projects.length === 0) loadProjects();
  }, [loadProjects, projects.length]);

  // Handle project selection
  const handleProjectClick = useCallback(
    (project: any) => {
      onSelectProject(project);
    },
    [onSelectProject]
  );

  // Filter projects with zones
  const filteredProjects = useMemo(
    () => projects.filter((p) => (p.zones?.length || 0) > 0),
    [projects]
  );

  // Paginate
  const paginatedProjects = useMemo(() => {
    const start = (projectPage - 1) * limit;
    return filteredProjects.slice(start, start + limit);
  }, [filteredProjects, projectPage]);

  // Gradient colors
  const projectGradients = [
    "from-slate-200 to-slate-100",
    "from-blue-100 to-blue-50",
    "from-gray-200 to-gray-10",
    "from-indigo-100 to-indigo-50",
  ];

  const isLoading = projectsLoading;
  const displayError = projectsError || localError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size="lg" content="ກຳລັງໂຫຼດຂໍ້ມູນໂຄງການ..." vertical />
      </div>
    );
  }

  if (displayError) {
    return (
      <div className="max-w-md mx-auto mt-12">
        <Message type="error" showIcon>
          <strong>ເກີດຂໍ້ຜິດພາດ:</strong> {displayError}
        </Message>
        <div className="text-center mt-4">
          <Button appearance="primary" onClick={loadProjects}>
            ລອງໃໝ່ອີກຄັ້ງ
          </Button>
        </div>
      </div>
    );
  }

  if (filteredProjects.length === 0) {
    return (
      <div className="text-center py-20">
        <Building2 className="w-20 h-20 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          ບໍ່ມີຂໍ້ມູນໂຄງການ
        </h3>
        <p className="text-gray-500">ບໍ່ພົບໂຄງການທີ່ມີໂຊນ</p>
      </div>
    );
  }

  return (
    <div>
      <div>
        <h4 className="text-xl font-semibold text-gray-800">ເລືອກໂຄງການ</h4>
        <p className="text-gray-600 text-sm mt-1">
          ກະລຸນາເລືອກໂຄງການທີ່ທ່ານຕ້ອງການ
        </p>
      </div>

      <Grid fluid>
        <Row gutter={16}>
          {paginatedProjects.map((project, idx) => {
            const isSelected = selectedProject?.projectId === project.projectId;

            return (
              <Col
                xs={24}
                sm={12}
                md={12}
                lg={6}
                key={project.projectId}

              >
                <div 
              
                  onClick={() => handleProjectClick(project)}
                  className={`rounded-xl mt-4 cursor-pointer transition-all duration-300 h-full hover:shadow-lg hover:scale-[1.01] ${
                    isSelected ? "ring-4 ring-blue-500 shadow-xl" : ""
                  }`}
                >
                  <div
                    className={`bg-linear-to-br  ${
                      projectGradients[idx % projectGradients.length]
                    } p-4 border ${
                      isSelected ? "border-blue-500" : "border-gray-200"
                    } rounded-xl h-full flex flex-col`}
                  >
                    {/* Header with Icon and Badge */}
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`${
                          isSelected ? "bg-blue-600" : "bg-gray-600"
                        } p-2 rounded-xl shadow-md transition-colors`}
                      >
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      {/* Project Name */}
                      <h4 className="text-lg font-bold text-gray-800 line-clamp-1">
                        {project.projectName}
                      </h4>
                    </div>

                    {/* Location */}
                    <div className="flex items-start gap-2 mb-3">
                      <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-gray-600" />
                      <span className="text-xs text-gray-700 leading-relaxed line-clamp-2">
                        {project.village && `ບ້ານ${project.village}, `}
                        {project.district?.districtName &&
                          `${project.district.districtName}, `}
                        {project.district?.province?.provinceName
                          ? `ແຂວງ${project.district.province.provinceName}`
                          : "ລາວ"}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-gray-600  line-clamp-2 min-h-8 grow">
                      {project.description || "ບໍ່ມີຄຳອະທິບາຍ"}
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 gap-2 ">
                      <Panel

                        className="bg-white/70 backdrop-blur-sm rounded-lg  border border-gray-200/50 shadow-sm"
                      >
                        <div className="flex items-center gap-1.5" >
                          <Layers className="w-3.5 h-3.5 text-gray-600" />
                          <span className="text-xs text-gray-600 font-medium">
                            ເນື້ອທີ່
                          </span>
                        </div>
                        <p className="font-bold text-sm text-gray-800">
                          {(project.totalLandArea || 0).toLocaleString()} ຕ.ມ
                        </p>
                      </Panel>
                      

                      <Panel
                        bordered
                        className="bg-white/70 backdrop-blur-sm rounded-lg border border-gray-200/50 shadow-sm"
                      >
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-gray-600" />
                          <span className="text-xs text-gray-600 font-medium">
                            ຈຳນວນໂຊນ
                          </span>
                        </div>
                        <p className="font-bold text-sm text-gray-800">
                          {project.zones?.length || 0} ໂຊນ
                        </p>
                      </Panel>
                    </div>


                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      </Grid>

      {filteredProjects.length > limit && (
        <div className="flex justify-center mt-8">
          <Pagination
            prev
            next
            first
            last
            ellipsis
            boundaryLinks
            total={filteredProjects.length}
            limit={limit}
            activePage={projectPage}
            onChangePage={setProjectPage}
            maxButtons={5}
            size="md"
          />
        </div>
      )}
    </div>
  );
};

export default ProjectSelect;

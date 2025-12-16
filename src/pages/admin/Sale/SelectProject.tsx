import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useProjectStore } from '../../../store/projectStore';
import { Building2, MapPin, Layers, ChevronRight } from 'lucide-react';
import { Button, Loader, Message, Pagination, Grid, Row, Col } from 'rsuite';

interface ProjectSelectionPageProps {
  onSelectProject: (project: any) => void;
}

const ProjectSelectionPage: React.FC<ProjectSelectionPageProps> = ({ onSelectProject }) => {
  const { projects, fetchProjects, isLoading, error } = useProjectStore();
  const [localError, setLocalError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 9;

  // Load projects
  const loadProjects = useCallback(async () => {
    try {
      setLocalError(null);
      await fetchProjects({ status: 'ACTIVE' });
    } catch (err: any) {
      setLocalError(err.message || 'ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນໂຄງການ');
    }
  }, [fetchProjects]);

  useEffect(() => {
    if (projects.length === 0) loadProjects();
  }, []);

  // Filter projects with zones
  const filteredProjects = useMemo(() => 
    projects.filter(p => (p.zones?.length || 0) > 0),
    [projects]
  );

  // Paginate
  const paginatedProjects = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredProjects.slice(start, start + limit);
  }, [filteredProjects, page]);

  // Gradient colors
  const gradients = [
    'bg-gradient-to-br from-slate-100 to-slate-200',
    'bg-gradient-to-br from-blue-50 to-blue-100',
    'bg-gradient-to-br from-gray-50 to-gray-100',
    'bg-gradient-to-br from-indigo-50 to-indigo-100',
  ];

  const displayError = error || localError;

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
          <Button appearance="primary" onClick={loadProjects}>ລອງໃໝ່ອີກຄັ້ງ</Button>
        </div>
      </div>
    );
  }

  if (filteredProjects.length === 0) {
    return (
      <div className="text-center py-20">
        <Building2 className="w-20 h-20 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">ບໍ່ມີຂໍ້ມູນໂຄງການ</h3>
        <p className="text-gray-500">ບໍ່ພົບໂຄງການທີ່ມີໂຊນ</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h4 className="text-2xl font-bold text-gray-800">ເລືອກໂຄງການ</h4>
        <p className="text-gray-600 mt-1">ກະລຸນາເລືອກໂຄງການທີ່ທ່ານຕ້ອງການຂາຍ</p>
      </div>

      <Grid fluid>
        <Row gutter={16}>
          {paginatedProjects.map((project, idx) => (
            <Col xs={24} sm={12} md={12} lg={6} key={project.projectId} className="mb-4">
              <div
                onClick={() => onSelectProject(project)}
                className="relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 h-full hover:shadow-lg hover:scale-[1.01]"
              >
                <div className={`${gradients[idx % gradients.length]} p-4 relative overflow-hidden border border-gray-200 h-full`}>
                  {/* Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gray-400 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-gray-400 rounded-full translate-y-1/2 -translate-x-1/2" />
                  </div>

                  {/* Icon */}
                  <div className="relative z-10 mb-3">
                    <div className="bg-blue-600 p-3 rounded-xl shadow-md w-fit">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                    
                  </div>

                  {/* Content */}
                  <div className="relative z-10 text-gray-800">
                    <h3 className="text-lg font-bold mb-2 line-clamp-1">
                      {project.projectName}
                    </h3>

                    <div className="flex items-start gap-2 mb-3">
                      <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-gray-600" />
                      <span className="text-xs text-gray-700 leading-relaxed line-clamp-2">
                        {project.village && `ບ້ານ${project.village}, `}
                        {project.district?.districtName && `${project.district.districtName}, `}
                        {project.district?.province?.provinceName || 'ລາວ'}
                        {/* {project.district &&  `ແຂວງ${project.district.province.provinceName}, `} */}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 mb-3 line-clamp-2 min-h-8">
                      {project.description || 'ບໍ່ມີຄຳອະທິບາຍ'}
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-300">
                      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-2 border border-gray-200">
                        <div className="flex items-center gap-1 mb-0.5">
                          <Layers className="w-3 h-3 text-gray-600" />
                          <span className="text-xs text-gray-600">ເນື້ອທີ່</span>
                        </div>
                        <p className="font-bold text-sm text-gray-800">
                          {(project.totalLandArea || 0).toLocaleString()} ຕ.ມ
                        </p>
                      </div>
                      
                      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-2 border border-gray-200">
                        <div className="flex items-center gap-1 mb-0.5">
                          <Building2 className="w-3 h-3 text-gray-600" />
                          <span className="text-xs text-gray-600">ຈຳນວນໂຊນ</span>
                        </div>
                        <p className="font-bold text-sm text-gray-800">
                          {project.zones?.length || 0} ໂຊນ
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="absolute bottom-3 right-3 z-10">
                    <div className="bg-white shadow-md p-1.5 rounded-full">
                      <ChevronRight className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Grid>

      {filteredProjects.length > limit && (
        <div className="flex justify-center mt-8">
          <Pagination
            prev next first last ellipsis boundaryLinks
            total={filteredProjects.length}
            limit={limit}
            activePage={page}
            onChangePage={setPage}
            maxButtons={5}
            size="md"
          />
        </div>
      )}

      <div className="mt-6 text-center text-sm text-gray-500">
        ສະແດງ {paginatedProjects.length} ຈາກທັງໝົດ {filteredProjects.length} ໂຄງການ
      </div>
    </div>
  );
};

export default ProjectSelectionPage;
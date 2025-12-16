import React, { useState, useCallback, useEffect } from "react";
import { Container, Content, Breadcrumb, Panel, Loader } from 'rsuite';
import { useNavigate, useParams } from 'react-router-dom';
import ProjectSelectionPage from "./SelectProject";
import ZoneSelectionPage from "./SelectZone";
import PropertyListPage from "./PropertyListPage";
import { useProjectStore } from "../../../store/projectStore";
import { useZoneStore } from "../../../store/zoneStore";

const SalePage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId, zoneId } = useParams<{ projectId?: string; zoneId?: string }>();
  
  const { projects, fetchProjects } = useProjectStore();
  const { zones, fetchZones } = useZoneStore();
  
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      // No params = reset all
      if (!projectId && !zoneId) {
        setSelectedProject(null);
        setSelectedZone(null);
        return;
      }

      setIsLoading(true);
      try {
        // Ensure projects are loaded
        if (projects.length === 0) {
          await fetchProjects({ status: 'ACTIVE' });
        }

        // Find project
        const project = projects.find(p => p.projectId === Number(projectId));
        if (!project) {
          navigate('/admin/sales', { replace: true });
          return;
        }

        setSelectedProject(project);

        // Load zones if needed
        if (zoneId) {
          if (zones.length === 0 || zones[0]?.projectId !== Number(projectId)) {
            await fetchZones({ projectId: Number(projectId) });
          }
          
          const zone = zones.find(z => 
            z.zoneId === Number(zoneId) && z.projectId === Number(projectId)
          );

          if (zone) {
            setSelectedZone(zone);
          } else {
            navigate(`/admin/sales/${projectId}`, { replace: true });
          }
        } else {
          setSelectedZone(null);
        }
      } catch (error) {
        console.error('Load error:', error);
        navigate('/admin/sales', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [projectId, zoneId]); // Only URL params

  // 📍 Handlers - Memoized
  const handleSelectProject = useCallback((project: any) => {
    setSelectedProject(project);
    setSelectedZone(null);
    navigate(`/admin/sales/${project.projectId}`);
  }, [navigate]);

  const handleSelectZone = useCallback((zone: any) => {
    setSelectedZone(zone);
    navigate(`/admin/sales/${selectedProject.projectId}/${zone.zoneId}`);
  }, [navigate, selectedProject]);

  const handleBackToProjects = useCallback(() => {
    setSelectedProject(null);
    setSelectedZone(null);
    navigate('/admin/sales');
  }, [navigate]);

  const handleBackToZones = useCallback(() => {
    setSelectedZone(null);
    navigate(`/admin/sales/${selectedProject?.projectId}`);
  }, [navigate, selectedProject]);


  if (isLoading) {
    return (
      <Container className="min-h-screen bg-gray-50">
        <Content className="max-w-7xl px-4">
          <div className="flex items-center justify-center py-20">
            <Loader size="lg" content="ກຳລັງໂຫຼດຂໍ້ມູນ..." vertical />
          </div>
        </Content>
      </Container>
    );
  }

  const CurrentView = !selectedProject 
    ? <ProjectSelectionPage onSelectProject={handleSelectProject} />
    : !selectedZone
    ? <ZoneSelectionPage
        selectedProject={selectedProject}
        onSelectZone={handleSelectZone}
        onBack={handleBackToProjects}
      />
    : <PropertyListPage
        selectedProject={selectedProject}
        selectedZone={selectedZone}
        onBack={handleBackToZones}
      />;

  return (
    <Container className="min-h-screen ">
      <Content className="max-w-7xl px-4 ">
        <Breadcrumb className="">
          
        </Breadcrumb>

        <Panel className="transition-all duration-300 ease-in-out">
          {CurrentView}
        </Panel>
      </Content>
    </Container>
  );
};

export default SalePage;
import React, { useState, useCallback, useRef, useEffect } from "react";
import { Container, Content, Panel, Affix, Steps, Divider } from "rsuite";
import ProjectSelectionPage from "./SelectProject";
import ZoneSelect from "./SelectZone";
import PropertyListPage from "./PropertyListPage";

const SalePage: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedZone, setSelectedZone] = useState<any>(null);

  // Refs for scrolling
  const projectRef = useRef<HTMLDivElement>(null);
  const zoneRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<HTMLDivElement>(null);

  // Calculate current step
  const currentStep = selectedZone ? 2 : selectedProject ? 1 : 0;

  // Handle project selection
  const handleSelectProject = useCallback((project: any) => {
    setSelectedProject(project);
    setSelectedZone(null);
  }, []);

  // Handle zone selection
  const handleSelectZone = useCallback((zone: any) => {
    setSelectedZone(zone);
  }, []);

  // Handle cancel zone selection
  const handleCancelZoneSelection = useCallback(() => {
    setSelectedProject(null);
    setSelectedZone(null);
  }, []);

  // Handle step click - navigate to specific step
  const handleStepClick = useCallback(
    (step: number) => {
      if (step === 0) {
        // Go back to project selection
        setSelectedProject(null);
        setSelectedZone(null);
        setTimeout(() => {
          projectRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      } else if (step === 1 && selectedProject) {
        // Go back to zone selection (only if project is selected)
        setSelectedZone(null);
        setTimeout(() => {
          zoneRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      }
      // Step 2 (plot) is the current view, no action needed
    },
    [selectedProject]
  );

  // Auto-scroll when project is selected
  useEffect(() => {
    if (selectedProject && zoneRef.current) {
      setTimeout(() => {
        zoneRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 300);
    }
  }, [selectedProject]);

  // Auto-scroll when zone is selected
  useEffect(() => {
    if (selectedZone && plotRef.current) {
      setTimeout(() => {
        plotRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 300);
    }
  }, [selectedZone]);

  return (
    <Container>
      <Content className="max-w-7xl bg-gray-50 mx-auto absolute">
        <Panel bordered={false}>
          {/* Title and Description */}
          <div className="text-center mb-4">
            <h3 className="text-gray-700!">
              ຊອກຫາດິນຫຼືບ້ານໄດ້ງ່າຍໆ ພຽງ 3 ຂັ້ນຕອນ
            </h3>
          </div>

          {/* Step Bar - Sticky */}
          <Affix top={64}>
            <div className="bg-white/50 backdrop-blur-lg! shadow-sm py-3 rounded-lg  px-4 ">
              <Steps current={currentStep} className="max-w-3xl mx-auto">
                <Steps.Item
                  title="PROJECT"
                  status={
                    selectedProject
                      ? "finish"
                      : currentStep === 0
                      ? "process"
                      : "wait"
                  }
                  onClick={() => handleStepClick(0)}
                  style={{ cursor: "pointer" }}
                />
                <Steps.Item
                  title="ZONE"
                  status={
                    selectedZone
                      ? "finish"
                      : currentStep === 1
                      ? "process"
                      : "wait"
                  }
                  onClick={() => selectedProject && handleStepClick(1)}
                  style={{
                    cursor: selectedProject ? "pointer" : "not-allowed",
                    opacity: selectedProject ? 1 : 0.5,
                  }}
                />
                <Steps.Item
                  title="PLOT"
                  status={currentStep === 2 ? "process" : "wait"}
                  style={{
                    cursor: "default",
                    opacity: selectedZone ? 1 : 0.5,
                  }}
                />
              </Steps>
            </div>
          </Affix>

          {/* 1. Projects Section */}
          <div ref={projectRef} className="scroll-mt-40">
            <Panel>
              <ProjectSelectionPage
                selectedProject={selectedProject}
                onSelectProject={handleSelectProject}
              />
            </Panel>
          </div>

          {/* 2. Zones Section */}
          {selectedProject && (
            <div ref={zoneRef} className="scroll-mt-40">
              <Divider className="my-8" />
              <Panel bordered={false}>
                <ZoneSelect
                  selectedProject={selectedProject}
                  onSelectZone={handleSelectZone}
                  onCancelSelection={handleCancelZoneSelection}
                />
              </Panel>
            </div>
          )}

          {/* 3. Properties Section */}
          {selectedZone && (
            <div ref={plotRef} className="scroll-mt-40">
              <Divider className="" />
              <Panel bordered={false}>
                <PropertyListPage
                  selectedProject={selectedProject}
                  selectedZone={selectedZone}
                  onBack={() => setSelectedZone(null)}
                />
              </Panel>
            </div>
          )}
        </Panel>
      </Content>
    </Container>
  );
};

export default SalePage;

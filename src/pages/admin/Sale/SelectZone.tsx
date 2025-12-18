import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useZoneStore } from "../../../store/zoneStore";
import { useAreaStore } from "../../../store/areaStore";
import { MapPin, Layers, Home, TrendingUp } from "lucide-react";
import {
  Button,
  Loader,
  Message,
  Pagination,
  Grid,
  Row,
  Col,
  Tag,
} from "rsuite";

interface ZoneSelectProps {
  selectedProject: any;
  selectedZone?: any;
  onSelectZone: (zone: any) => void;
  onCancelSelection: () => void;
}

const ZoneSelect: React.FC<ZoneSelectProps> = ({
  selectedProject,
  selectedZone,
  onSelectZone,
  onCancelSelection,
}) => {
  const {
    zones,
    fetchZones,
    isLoading: zonesLoading,
    error: zonesError,
  } = useZoneStore();
  const { zoneArea, fetchZoneArea } = useAreaStore();

  const [localError, setLocalError] = useState<string | null>(null);
  const [zonePage, setZonePage] = useState(1);
  const [zoneAreaCache, setZoneAreaCache] = useState<Record<number, any>>({});
  const limit = 8;

  // Load zones when project is selected
  const loadZones = useCallback(
    async (projectId: number) => {
      try {
        setLocalError(null);
        await fetchZones({ projectId });
      } catch (err: any) {
        setLocalError(err.message || "ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນໂຊນ");
      }
    },
    [fetchZones]
  );

  useEffect(() => {
    if (selectedProject) {
      loadZones(selectedProject.projectId);
      setZonePage(1);
      setZoneAreaCache({});
    }
  }, [selectedProject?.projectId, loadZones]);

  // Filter zones with HOUSE type or LAND type
  const filteredZones = useMemo(() => {
    if (!selectedProject) return [];
    return zones.filter((zone) => {
      if (zone.projectId !== Number(selectedProject?.projectId)) return false;
      return zone.zoneType === "LAND" || zone.zoneType === "HOUSE";
    });
  }, [zones, selectedProject]);

  // Paginate zones
  const paginatedZones = useMemo(() => {
    const start = (zonePage - 1) * limit;
    return filteredZones.slice(start, start + limit);
  }, [filteredZones, zonePage]);

  // Load area data for visible zones
  useEffect(() => {
    if (!selectedProject || paginatedZones.length === 0) return;

    paginatedZones.forEach((zone) => {
      if (zoneAreaCache[zone.zoneId as number]) return;

      fetchZoneArea(String(zone.zoneId)).catch((err) => {
        console.error(`Failed to fetch area for zone ${zone.zoneId}:`, err);
      });
    });
  }, [paginatedZones, selectedProject, fetchZoneArea]);

  // Cache zone area data
  useEffect(() => {
    if (zoneArea && zoneArea.zoneId) {
      setZoneAreaCache((prev) => ({
        ...prev,
        [zoneArea.zoneId]: zoneArea,
      }));
    }
  }, [zoneArea]);

  // Gradient colors
  const zoneGradients = [
    "from-indigo-100 to-indigo-50",
    "from-gray-200 to-gray-10",
    "from-blue-100 to-blue-50",
    "from-slate-200 to-slate-100",
  ];

  if (!selectedProject) {
    return null;
  }

  const displayError = zonesError || localError;

  return (
    <div className="max-w-7xl mx-auto ">
      <div >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-2xl font-bold text-gray-800">ເລືອກໂຊນ</h4>
            <p className="text-gray-600 text-sm mt-1">
              ໂຊນໃນໂຄງການ:{" "}
              <span className="font-semibold text-blue-600">
                {selectedProject.projectName}
              </span>
            </p>
          </div>
          <Button
            appearance="ghost"
            color="red"
            size="sm"
            onClick={onCancelSelection}
          >
            ຍົກເລີກການເລືອກ
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {displayError && (
        <div className="mb-6">
          <Message type="error" showIcon>
            <strong>ເກີດຂໍ້ຜິດພາດ:</strong> {displayError}
          </Message>
          <div className="text-center mt-4">
            <Button
              appearance="primary"
              onClick={() => loadZones(selectedProject.projectId)}
            >
              ລອງໃໝ່ອີກຄັ້ງ
            </Button>
          </div>
        </div>
      )}

      {zonesLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader size="lg" content="ກຳລັງໂຫຼດຂໍ້ມູນໂຊນ..." vertical />
        </div>
      ) : filteredZones.length === 0 && !displayError ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl">
          <MapPin className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            ບໍ່ມີຂໍ້ມູນໂຊນ
          </h3>
          <p className="text-gray-500">ບໍ່ພົບໂຊນໃນໂຄງການນີ້</p>
        </div>
      ) : filteredZones.length > 0 ? (
        <>
          <Grid fluid>
            <Row gutter={16}>
              {paginatedZones.map((zone, idx) => {
                const isLand = zone.zoneType === "LAND";
                const isSelected = selectedZone?.zoneId === zone.zoneId;

                const cachedArea = zoneAreaCache[zone.zoneId as number];
                const area = cachedArea
                  ? {
                      total: cachedArea.totalArea,
                      used: cachedArea.usedArea,
                      remaining: cachedArea.remainingArea,
                      utilization: cachedArea.usedPercentage || 0,
                    }
                  : {
                      total: zone.totalLandArea || 0,
                      used: 0,
                      remaining: zone.totalLandArea || 0,
                      utilization: 0,
                    };

                return (
                  <Col xs={24} sm={12} md={12} lg={6} key={zone.zoneId}>
                    <div
                      onClick={() => onSelectZone(zone)}
                      className={`rounded-xl mt-4 cursor-pointer transition-all duration-300 h-full hover:shadow-lg hover:scale-[1.01] ${
                        isSelected ? "ring-4 ring-blue-500 shadow-xl" : ""
                      }`}
                    >
                      <div
                        className={`bg-linear-to-br ${
                          zoneGradients[idx % zoneGradients.length]
                        } p-4 border ${
                          isSelected ? "border-blue-500" : "border-gray-200"
                        } rounded-xl h-full flex flex-col`}
                      >
                        {/* Header with Icon and Tag */}
                        <div className="flex gap items-start justify-between mb-1">
                          <div className=" flex gap-1.5">
                            <div
                              className={`${
                                isSelected ? "bg-blue-600" : "bg-gray-600"
                              } p-2 rounded-xl shadow-md transition-colors`}
                            >
                              {isLand ? (
                                <MapPin className="w-5 h-5 text-white" />
                              ) : (
                                <Home className="w-5 h-5 text-white" />
                              )}
                            </div>
                            <div className="">
                              <h4 className="text-lg font-bold line-clamp-1 text-gray-800">
                                {zone.zoneName}
                              </h4>
                            </div>
                          </div>
                          <Tag color={isLand ? "green" : "blue"} size="md">
                            {isLand ? "ແປງດິນ" : "ເຮືອນ"}
                          </Tag>
                        </div>
                        <p className="text-xs text-gray-600 mb-3">
                          {zone.zoneCode || "ບໍ່ມີລະຫັດ"}
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-2 mb-3 grow">
                          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-2.5 border border-gray-200/50 shadow-sm">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Layers className="w-3.5 h-3.5 text-gray-600" />
                              <span className="text-xs text-gray-600 font-medium">
                                ເນື້ອທີ່
                              </span>
                            </div>
                            <p className="font-bold text-sm text-gray-800">
                              {area.total?.toLocaleString() || "0"} ຕ.ມ
                            </p>
                          </div>

                          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-2.5 border border-gray-200/50 shadow-sm">
                            <div className="flex items-center gap-1.5 mb-1">
                              <TrendingUp className="w-3.5 h-3.5 text-gray-600" />
                              <span className="text-xs text-gray-600 font-medium">
                                ຍັງເຫຼືອ
                              </span>
                            </div>
                            <p className="font-bold text-sm text-green-600">
                              {area.remaining?.toLocaleString() || "0"} ຕ.ມ
                            </p>
                          </div>
                        </div>

                        {/* Usage Bar */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-lg p-2.5 border border-gray-200/50 shadow-sm mb-3">
                          <div className="flex justify-between items-center text-xs mb-1.5">
                            <span className="text-gray-600 font-medium">
                              ການນຳໃຊ້
                            </span>
                            <span
                              className={`font-semibold ${
                                area.utilization >= 90
                                  ? "text-red-600"
                                  : area.utilization >= 70
                                  ? "text-orange-600"
                                  : "text-green-600"
                              }`}
                            >
                              {area.utilization.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                area.utilization >= 90
                                  ? "bg-red-500"
                                  : area.utilization >= 70
                                  ? "bg-orange-500"
                                  : "bg-green-500"
                              }`}
                              style={{
                                width: `${Math.min(100, area.utilization)}%`,
                              }}
                            />
                          </div>
                        </div>

                        {/* Price */}
                        {zone.pricePerSqm && (
                          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2.5 border border-gray-200/50 shadow-sm mb-3">
                            <p className="text-xs text-gray-600 mb-0.5 font-medium">
                              ລາຄາ/ຕ.ມ
                            </p>
                            <p className="text-sm font-bold text-blue-600">
                              {zone.pricePerSqm.toLocaleString()} ₭
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>
          </Grid>

          {filteredZones.length > limit && (
            <div className="flex justify-center mt-8">
              <Pagination
                prev
                next
                first
                last
                ellipsis
                boundaryLinks
                total={filteredZones.length}
                limit={limit}
                activePage={zonePage}
                onChangePage={setZonePage}
                maxButtons={5}
                size="md"
              />
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};

export default ZoneSelect;

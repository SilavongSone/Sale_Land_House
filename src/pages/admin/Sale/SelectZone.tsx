import React, { useState, useEffect, useMemo } from "react";
import { useZoneStore } from "../../../store/zoneStore";
import { useHouseStore } from "../../../store/houseStore";
import { useLandPlotStore } from "../../../store/landPlotStore";
import { MapPin, Home, Layers, TrendingUp, ChevronRight } from "lucide-react";
import { Button, Tag, Loader, Message, Pagination, Grid, Row, Col } from "rsuite";
import { getZoneAreaBreakdown } from "../../../utils/area/summary";

interface ZoneSelectionPageProps {
  selectedProject: any;
  onSelectZone: (zone: any) => void;
  onBack: () => void;
}

const ZoneSelectionPage: React.FC<ZoneSelectionPageProps> = ({
  selectedProject,
  onSelectZone,
  onBack,
}) => {
  const { zones, fetchZones, isLoading, error } = useZoneStore();
  const { houses, fetchHouses } = useHouseStore();
  const { landPlots, fetchLandPlots } = useLandPlotStore();
  const [page, setPage] = useState(1);
  const [localError, setLocalError] = useState<string | null>(null);
  const limit = 9;

  // Load data once
  useEffect(() => {
    if (!selectedProject?.projectId) return;

    const loadData = async () => {
      try {
        setLocalError(null);
        const projectId = selectedProject.projectId;
        await Promise.all([
          fetchZones({ projectId }),
          fetchHouses({ projectId }),
          fetchLandPlots({ projectId })
        ]);
      } catch (err: any) {
        setLocalError(err.message || "ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ");
      }
    };

    loadData();
  }, [selectedProject?.projectId]);

  // Filter zones with properties
  const filteredZones = useMemo(() => {
    return zones.filter(zone => {
      if (zone.projectId !== Number(selectedProject?.projectId)) return false;
      if (zone.zoneType === "LAND") return true;
      return houses.filter(h => h.zoneId === zone.zoneId).length > 0;
    });
  }, [zones, houses, selectedProject?.projectId]);

  // Paginate
  const paginatedZones = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredZones.slice(start, start + limit);
  }, [filteredZones, page]);

  // Gradient colors
  const gradients = [
    'bg-gradient-to-br from-slate-100 to-slate-200',
    'bg-gradient-to-br from-blue-50 to-blue-100',
    'bg-gradient-to-br from-green-50 to-green-100',
    'bg-gradient-to-br from-indigo-50 to-indigo-100',
  ];

  const displayError = error || localError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size="lg" content="ກຳລັງໂຫຼດຂໍ້ມູນໂຊນ..." vertical />
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
          <Button appearance="primary" onClick={onBack}>ກັບຄືນ</Button>
        </div>
      </div>
    );
  }

  if (filteredZones.length === 0) {
    return (
      <div className="text-center py-20">
        <MapPin className="w-20 h-20 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">ບໍ່ມີຂໍ້ມູນໂຊນ</h3>
        <p className="text-gray-500">ບໍ່ພົບໂຊນໃນໂຄງການນີ້</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h4 className="text-2xl font-bold text-gray-800">ເລືອກໂຊນ</h4>
        <p className="text-gray-600 mt-1">ກະລຸນາເລືອກໂຊນທີ່ທ່ານຕ້ອງການຂາຍ</p>
      </div>

      <Grid fluid>
        <Row gutter={16}>
          {paginatedZones.map((zone, idx) => {
            const isLand = zone.zoneType === "LAND";
            const area = getZoneAreaBreakdown(zone.zoneId, zone.totalLandArea, houses, landPlots);

            return (
              <Col xs={24} sm={12} md={12} lg={6} key={zone.zoneId} className="mb-4">
                <div
                  onClick={() => onSelectZone(zone)}
                  className="relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 h-full hover:shadow-lg hover:scale-[1.01]"
                >
                  <div className={`${gradients[idx % gradients.length]} p-4 relative overflow-hidden border border-gray-200 h-full`}>
                    {/* Pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute top-0 right-0 w-40 h-40 bg-gray-400 rounded-full -translate-y-1/2 translate-x-1/2" />
                      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gray-400 rounded-full translate-y-1/2 -translate-x-1/2" />
                    </div>

                    {/* Icon & Tag */}
                    <div className="relative z-10 mb-3 flex items-center justify-between">
                      <div className={`${isLand ? 'bg-green-600' : 'bg-blue-600'} p-3 rounded-xl shadow-md w-fit`}>
                        {isLand ? (
                          <MapPin className="w-8 h-8 text-white" />
                        ) : (
                          <Home className="w-8 h-8 text-white" />
                        )}
                      </div>
                      <Tag color={isLand ? "green" : "blue"} size="md">
                        {isLand ? "ແປງດິນ" : "ເຮືອນ"}
                      </Tag>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 text-gray-800">
                      <h3 className="text-lg font-bold mb-1 line-clamp-1">
                        {zone.zoneName}
                      </h3>
                      <p className="text-xs text-gray-600 mb-3">
                        {zone.zoneCode || "ບໍ່ມີລະຫັດ"}
                      </p>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-2 border border-gray-200">
                          <div className="flex items-center gap-1 mb-0.5">
                            <Layers className="w-3 h-3 text-gray-600" />
                            <span className="text-xs text-gray-600">ເນື້ອທີ່</span>
                          </div>
                          <p className="font-bold text-sm text-gray-800">
                            {zone.totalLandArea?.toLocaleString() || "0"} ຕ.ມ
                          </p>
                        </div>

                        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-2 border border-gray-200">
                          <div className="flex items-center gap-1 mb-0.5">
                            <TrendingUp className="w-3 h-3 text-gray-600" />
                            <span className="text-xs text-gray-600">ຍັງເຫຼືອ</span>
                          </div>
                          <p className="font-bold text-sm text-green-600">
                            {area.remaining.toLocaleString()} ຕ.ມ
                          </p>
                        </div>
                      </div>

                      {/* Usage Bar */}
                      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-2 border border-gray-200">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">ການນຳໃຊ້</span>
                          <span className={`font-semibold ${
                            area.utilization >= 90 ? 'text-red-600' : 
                            area.utilization >= 70 ? 'text-orange-600' : 
                            'text-green-600'
                          }`}>
                            {area.utilization.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              area.utilization >= 90 ? 'bg-red-500' : 
                              area.utilization >= 70 ? 'bg-orange-500' : 
                              'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(100, area.utilization)}%` }}
                          />
                        </div>
                      </div>

                      {/* Price (if available) */}
                      {zone.pricePerSqm && (
                        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2 border border-gray-200 mt-2">
                          <p className="text-xs text-gray-600 mb-0.5">ລາຄາ/ຕ.ມ</p>
                          <p className="text-sm font-bold text-blue-600">
                            {zone.pricePerSqm.toLocaleString()} ₭
                          </p>
                        </div>
                      )}
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
            );
          })}
        </Row>
      </Grid>

      {filteredZones.length > limit && (
        <div className="flex justify-center mt-8">
          <Pagination
            prev next first last ellipsis boundaryLinks
            total={filteredZones.length}
            limit={limit}
            activePage={page}
            onChangePage={setPage}
            maxButtons={5}
            size="md"
          />
        </div>
      )}

      <div className="mt-6 text-center text-sm text-gray-500">
        ສະແດງ {paginatedZones.length} ຈາກທັງໝົດ {filteredZones.length} ໂຊນ
      </div>
    </div>
  );
};

export default ZoneSelectionPage;
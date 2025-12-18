import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLandPlotStore } from "../../../store/landPlotStore";
import { useHouseStore } from "../../../store/houseStore";
import {
  MapPin,
  Home,
  Plus,
  Maximize2,
  BedDouble,
  ChevronRight,
  Layers,
} from "lucide-react";
import { Button, Tag, Loader, Message, Pagination, Grid, Row, Col, Panel } from "rsuite";
import LandPlotForm from "../../admin/LandManage/LandForm";
import PaymentModal from "./Summary";
import DetailLandPlot from "./DetailLandPlot";
import DetailHouse from "./DetailHouse";
import type { LandPlot } from "../../../types/landPlot";
import type { House } from "../../../types/house";

interface PropertyListProps {
  selectedProject: any;
  selectedZone: any;
  onBack: () => void;
}

// Type guard functions
function isLandPlot(property: LandPlot | House): property is LandPlot {
  return "landPlotId" in property;
}

const PropertyList: React.FC<PropertyListProps> = ({
  selectedProject,
  selectedZone,
  onBack,
}) => {
  const isLand = selectedZone?.zoneType === "LAND";
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [selectedPropertyForDetails, setSelectedPropertyForDetails] =
    useState<LandPlot | House | null>(null);
  const [page, setPage] = useState(1);
  const limit = 8;

  const {
    landPlots,
    fetchLandPlots,
    isLoading: landLoading,
    error: landError,
  } = useLandPlotStore();
  console.log("dadad",landPlots);
  
  const {
    houses,
    fetchHouses,
    isLoading: houseLoading,
    error: houseError,
  } = useHouseStore();

  // Load data based on zone type
  useEffect(() => {
    if (!selectedZone?.zoneId) return;

    const zoneId = selectedZone.zoneId;
    
    if (isLand) {
      // For LAND zones, fetch land plots and houses (for landPlot form)
      fetchLandPlots({ zoneId });
      fetchHouses({ zoneId }); // Needed for LandPlotForm
    } else {
      // For HOUSE zones, only fetch houses
      fetchHouses({ zoneId });
    }
  }, [selectedZone?.zoneId, isLand, fetchLandPlots, fetchHouses]);

  // Get ALL land plots in zone (for LandPlotForm)
  const landPlotsInZone = useMemo<LandPlot[]>(() => {
    if (!isLand || !selectedZone?.zoneId) return [];
    return landPlots.filter((p) => p.zoneId === selectedZone.zoneId);
  }, [isLand, landPlots, selectedZone?.zoneId]);

  // Get available land plots
  const landAvailable = useMemo<LandPlot[]>(() => {
    if (!isLand) return [];
    return landPlotsInZone.filter((p) => p.status === "AVAILABLE");
  }, [isLand, landPlotsInZone]);

  // Get available houses
  const houseAvailable = useMemo<House[]>(() => {
    if (isLand || !selectedZone?.zoneId) return [];
    return houses.filter(
      (h) => h.zoneId === selectedZone.zoneId && h.status === "AVAILABLE"
    );
  }, [isLand, houses, selectedZone?.zoneId]);

  // Combine available properties
  const available = useMemo(() => {
    return isLand ? landAvailable : houseAvailable;
  }, [isLand, landAvailable, houseAvailable]);

  // Paginate
  const paginated = useMemo(() => {
    const start = (page - 1) * limit;
    return available.slice(start, start + limit);
  }, [available, page]);

  // Gradient colors
  const gradients = [
    "from-slate-200 to-slate-100",
    "from-blue-100 to-blue-50",
    "from-gray-200 to-gray-100",
    "from-indigo-100 to-indigo-50",
  ];

  // Handlers
  const handleCreateSuccess = useCallback(() => {
    setIsCreateModalOpen(false);
    if (selectedZone?.zoneId) {
      fetchLandPlots({ zoneId: selectedZone.zoneId });
    }
  }, [selectedZone?.zoneId, fetchLandPlots]);

  const handleViewDetails = useCallback((property: LandPlot | House) => {
    setSelectedPropertyForDetails(property);
    setIsDetailsModalOpen(true);
  }, []);

  const handleBuyFromDetails = useCallback(
    (property: LandPlot | House) => {
      const propertyType = isLand ? "LAND" : "HOUSE";
      const propertyId = isLandPlot(property)
        ? property.landPlotId
        : property.id;
      const price = isLandPlot(property)
        ? property.totalPrice || 0
        : property.housePrice || 0;

      setSelectedProperty({
        ...property,
        propertyType,
        propertyId,
        zoneId: selectedZone?.zoneId,
        price,
        totalPrice: price,
      });

      setIsDetailsModalOpen(false);
      setIsPaymentModalOpen(true);
    },
    [isLand, selectedZone?.zoneId]
  );

  const handleRefresh = useCallback(async () => {
    if (!selectedZone?.zoneId) return;
    
    if (isLand) {
      await fetchLandPlots({ zoneId: selectedZone.zoneId });
    } else {
      await fetchHouses({ zoneId: selectedZone.zoneId });
    }
  }, [selectedZone?.zoneId, isLand, fetchLandPlots, fetchHouses]);

  const handleRetry = useCallback(() => {
    if (!selectedZone?.zoneId) return;
    
    if (isLand) {
      fetchLandPlots({ zoneId: selectedZone.zoneId });
      fetchHouses({ zoneId: selectedZone.zoneId });
    } else {
      fetchHouses({ zoneId: selectedZone.zoneId });
    }
  }, [selectedZone?.zoneId, isLand, fetchLandPlots, fetchHouses]);

  // Loading and error states
  const isLoading = isLand ? landLoading : houseLoading;
  const displayError = isLand ? landError : houseError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size="lg" content="ກຳລັງໂຫຼດຂໍ້ມູນ..." vertical />
      </div>
    );
  }

  if (displayError) {
    return (
      <div className="max-w-md mx-auto mt-12">
        <Message type="error" showIcon>
          <strong>ເກີດຂໍ້ຜິດພາດ:</strong> {displayError}
        </Message>
        <div className="text-center mt-4 space-x-2">
          <Button appearance="primary" onClick={handleRetry}>
            ລອງໃໝ່ອີກຄັ້ງ
          </Button>
          <Button appearance="ghost" onClick={onBack}>
            ກັບຄືນ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto " >
      {/* Modals */}
      {isLand && (
        <LandPlotForm
          open={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          landPlot={null}
          houses={houses.filter((h) => h.zoneId === selectedZone?.zoneId)}
          landPlots={landPlotsInZone}
          projects={[selectedProject]}
          preSelectedProjectId={selectedProject?.projectId}
          preSelectedZoneId={selectedZone?.zoneId}
          onSuccess={handleCreateSuccess}
        />
      )}

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedProperty(null);
        }}
        selectedProperty={selectedProperty}
        onSuccess={handleRefresh}
      />

      {isLand && selectedPropertyForDetails && isLandPlot(selectedPropertyForDetails) ? (
        <DetailLandPlot
          landPlot={selectedPropertyForDetails}
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedPropertyForDetails(null);
          }}
          onBuy={handleBuyFromDetails}
        />
      ) : !isLand && selectedPropertyForDetails && !isLandPlot(selectedPropertyForDetails) ? (
        <DetailHouse
          house={selectedPropertyForDetails}
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedPropertyForDetails(null);
          }}
          onBuy={handleBuyFromDetails}
        />
      ) : null}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xl font-semibold text-gray-800">
              {isLand ? "ລາຍການແປງດິນ" : "ລາຍການເຮືອນ"}
            </h4>
            <p className="text-gray-600 text-sm mt-1">
              ໃນໂຊນ:{" "}
              <span className="font-semibold text-blue-600">
                {selectedZone?.zoneName}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button appearance="ghost" onClick={onBack}>
              ກັບຄືນ
            </Button>
            {isLand && available.length > 0 && (
              <Button
                appearance="primary"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus className="w-5 h-5 inline mr-2" />
                ແປງດິນໃໝ່
              </Button>
            )}
          </div>
        </div>
      </div>

      {available.length === 0 ? (
        // Empty State
        <div className="text-center py-20">
          {isLand ? (
            <MapPin className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          ) : (
            <Home className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          )}
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            ບໍ່ມີລາຍການ{isLand ? "ແປງດິນ" : "ເຮືອນ"}ທີ່ວ່າງ
          </h3>
          <p className="text-gray-500 mb-6">
            ຍັງບໍ່ມີລາຍການ{isLand ? "ແປງດິນ" : "ເຮືອນ"}ທີ່ພ້ອມຂາຍໃນໂຊນນີ້
          </p>
          {isLand && (
            <Button
              appearance="primary"
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              ສ້າງແປງດິນ
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Property Grid */}
          <Grid fluid>
            <Row gutter={16}>
              {paginated.map((property, idx) => {
                const id = isLandPlot(property)
                  ? property.landPlotId
                  : property.id;
                const name = isLandPlot(property)
                  ? property.plotNumber
                  : property.houseNumber;
                const size = isLandPlot(property)
                  ? property.landArea
                  : property.landArea;
                const price = isLandPlot(property)
                  ? property.totalPrice
                  : property.housePrice;

                return (
                  <Col xs={24} sm={12} md={12} lg={6} key={id}>
                    <div
                      onClick={() => handleViewDetails(property)}
                      className="rounded-xl  cursor-pointer transition-all duration-300 h-full hover:shadow-lg hover:scale-[1.01]"
                    >
                      <div
                        className={`bg-linear-to-br ${
                          gradients[idx % gradients.length]
                        } p-4 border border-gray-200 rounded-xl h-full flex flex-col`}
                      >
                        {/* Header with Icon and Status */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="bg-blue-600 p-2 rounded-xl shadow-md transition-colors">
                              {isLand ? (
                                <MapPin className="w-5 h-5 text-white" />
                              ) : (
                                <Home className="w-5 h-5 text-white" />
                              )}
                            </div>
                            <h4 className="text-lg font-bold text-gray-800 line-clamp-1">
                              {isLand ? `ແປງດິນ ${name}` : `ເຮືອນ ${name}`}
                            </h4>
                          </div>
                          <Tag color="green" size="sm">
                            ຍັງວ່າງ
                          </Tag>
                        </div>

                        {/* Location */}
                        <div className="flex items-start gap-2 mb-3">
                          <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-gray-600" />
                          <span className="text-xs text-gray-700 leading-relaxed line-clamp-1">
                            {selectedZone?.zoneName} • {selectedProject?.projectName}
                          </span>
                        </div>

                        {/* Property Details Grid */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <Panel
                            bordered
                            className="bg-white/70 backdrop-blur-sm rounded-lg border border-gray-200/50 shadow-sm"
                          >
                            <div className="flex items-center gap-1.5">
                              <Maximize2 className="w-3.5 h-3.5 text-gray-600" />
                              <span className="text-xs text-gray-600 font-medium">
                                ເນື້ອທີ່
                              </span>
                            </div>
                            <p className="font-bold text-sm text-gray-800">
                              {size?.toLocaleString() || 0} ຕ.ມ
                            </p>
                          </Panel>

                          {isLandPlot(property) &&
                          property.plotWidth &&
                          property.plotLength ? (
                            <Panel
                              bordered
                              className="bg-white/70 backdrop-blur-sm rounded-lg border border-gray-200/50 shadow-sm"
                            >
                              <div className="flex items-center gap-1.5">
                                <Layers className="w-3.5 h-3.5 text-gray-600" />
                                <span className="text-xs text-gray-600 font-medium">
                                  ຂະໜາດ
                                </span>
                              </div>
                              <p className="font-bold text-sm text-gray-800">
                                {property.plotWidth}×{property.plotLength} ມ
                              </p>
                            </Panel>
                          ) : !isLandPlot(property) &&
                            property.bedrooms !== undefined ? (
                            <Panel
                              bordered
                              className="bg-white/70 backdrop-blur-sm rounded-lg border border-gray-200/50 shadow-sm"
                            >
                              <div className="flex items-center gap-1.5">
                                <BedDouble className="w-3.5 h-3.5 text-gray-600" />
                                <span className="text-xs text-gray-600 font-medium">
                                  ຫ້ອງນອນ
                                </span>
                              </div>
                              <p className="font-bold text-sm text-gray-800">
                                {property.bedrooms} ຫ້ອງ
                              </p>
                            </Panel>
                          ) : null}
                        </div>

                        {/* Price Section */}
                        <Panel
                          bordered
                          className="bg-white/70 backdrop-blur-sm rounded-lg border border-gray-200/50 shadow-sm mt-auto"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs text-gray-600 font-medium mb-0.5">
                                ລາຄາເລີ່ມຕົ້ນ
                              </div>
                              <p className="font-bold text-lg text-gray-800">
                                ${price?.toLocaleString() || 0}
                              </p>
                            </div>
                            <div className="bg-blue-600 shadow-md p-1.5 rounded-full">
                              <ChevronRight className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        </Panel>
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>
          </Grid>

          {/* Pagination */}
          {available.length > limit && (
            <div className="flex justify-center mt-8">
              <Pagination
                prev
                next
                first
                last
                ellipsis
                boundaryLinks
                total={available.length}
                limit={limit}
                activePage={page}
                onChangePage={setPage}
                maxButtons={5}
                size="md"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PropertyList;
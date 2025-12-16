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
  Building2,
} from "lucide-react";
import { Button, Tag, Loader, Pagination, Grid, Row, Col } from "rsuite";
import LandPlotForm from "../../admin/LandManage/LandForm";
import PaymentModal from "../../admin/Sale/PaymentSummaryPage";
import DetailLandPlot from "./DetailLandPlot";
import DetailHouse from "./DetailHouse";
import type { LandPlot } from "../../../types/landPlot";
import type { House } from "../../../types/house";

interface PropertyListPageProps {
  selectedProject: any;
  selectedZone: any;
  onBack: () => void;
}

// Type guard functions
function isLandPlot(property: LandPlot | House): property is LandPlot {
  return "landPlotId" in property;
}

const PropertyListPage: React.FC<PropertyListPageProps> = ({
  selectedProject,
  selectedZone,
}) => {
  const isLand = selectedZone?.zoneType === "LAND";
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [selectedPropertyForDetails, setSelectedPropertyForDetails] =
    useState<any>(null);
  const [page, setPage] = useState(1);
  const limit = 9;

  const {
    landPlots,
    fetchLandPlots,
    isLoading: landLoading,
  } = useLandPlotStore();
  const { houses, fetchHouses, isLoading: houseLoading } = useHouseStore();

  // Load data
  useEffect(() => {
    if (!selectedZone?.zoneId) return;

    const zoneId = selectedZone.zoneId;
    if (isLand) {
      fetchLandPlots({ zoneId });
      fetchHouses({ zoneId });
    } else {
      fetchHouses({ zoneId });
    }
  }, [selectedZone?.zoneId, isLand, fetchLandPlots, fetchHouses]);

  // Get ALL land plots in zone
  const landPlotsInZone = useMemo<LandPlot[]>(() => {
    if (!isLand) return [];
    return landPlots.filter((p) => p.zoneId === selectedZone?.zoneId);
  }, [isLand, landPlots, selectedZone?.zoneId]);

  // Get available properties
  const landAvailable = useMemo<LandPlot[]>(() => {
    return landPlotsInZone.filter((p) => p.status === "AVAILABLE");
  }, [landPlotsInZone]);

  const houseAvailable = useMemo<House[]>(() => {
    if (isLand) return [];
    return houses.filter(
      (h) => h.zoneId === selectedZone?.zoneId && h.status === "AVAILABLE"
    );
  }, [isLand, houses, selectedZone?.zoneId]);

  const available = isLand ? landAvailable : houseAvailable;

  const paginated = useMemo(() => {
    const start = (page - 1) * limit;
    return available.slice(start, start + limit);
  }, [available, page]);

  const totalAvailable = available.length;

  // Gradient colors - matching ProjectSelectionPage
  const gradients = [
    "bg-gradient-to-br from-slate-100 to-slate-200",
    "bg-gradient-to-br from-blue-50 to-blue-100",
    "bg-gradient-to-br from-gray-50 to-gray-100",
    "bg-gradient-to-br from-indigo-50 to-indigo-100",
  ];

  const handleCreateSuccess = useCallback(() => {
    setIsCreateModalOpen(false);
    if (selectedZone?.zoneId) {
      fetchLandPlots({ zoneId: selectedZone.zoneId });
    }
  }, [selectedZone?.zoneId, fetchLandPlots]);

  const handleViewDetails = useCallback((property: any) => {
    setSelectedPropertyForDetails(property);
    setIsDetailsModalOpen(true);
  }, []);

  const handleBuyFromDetails = useCallback(
    (property: any) => {
      const type = isLand ? "LAND" : "HOUSE";
      const id = isLand
        ? isLandPlot(property)
          ? property.landPlotId
          : property.id
        : property.id;
      const price = isLand
        ? property.totalPrice || 0
        : property.housePrice || 0;

      setSelectedProperty({
        ...property,
        propertyType: type,
        propertyId: id,
        zoneId: selectedZone?.zoneId,
        price,
        totalPrice: price,
      });

      setIsDetailsModalOpen(false);
      setIsPaymentModalOpen(true);
    },
    [isLand, selectedZone]
  );

  const handleRefresh = useCallback(async () => {
    if (!selectedZone?.zoneId) return;
    const fn = isLand ? fetchLandPlots : fetchHouses;
    await fn({ zoneId: selectedZone.zoneId });
  }, [selectedZone?.zoneId, isLand, fetchLandPlots, fetchHouses]);

  const isLoading = isLand ? landLoading : houseLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size="lg" content="ກຳລັງໂຫຼດຂໍ້ມູນ..." vertical />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
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

      {isLand ? (
        <DetailLandPlot
          landPlot={selectedPropertyForDetails}
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedPropertyForDetails(null);
          }}
          onBuy={handleBuyFromDetails}
        />
      ) : (
        <DetailHouse
          house={selectedPropertyForDetails}
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedPropertyForDetails(null);
          }}
          onBuy={handleBuyFromDetails}
        />
      )}

      <div className="mb-6 flex items-center justify-between">
        <h4 className="text-2xl font-bold text-gray-800">
          {isLand ? "ລາຍການແປງດິນ" : "ລາຍການເຮືອນ"}
        </h4>

        {isLand && available.length > 0 && (
          <Button
            appearance="primary"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="w-5 h-5 inline mr-2" />
            ສ້າງແປງດິນໃໝ່
          </Button>
        )}
      </div>

      {available.length === 0 ? (
        // Empty State - styled like ProjectSelectionPage
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
              ສ້າງແປງດິນແຫ່ງທຳອິດ
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Property Grid - styled like ProjectSelectionPage */}
          <Grid fluid>
            <Row gutter={16}>
              {paginated.map((property, idx) => {
                const id = isLandPlot(property)
                  ? property.landPlotId
                  : property.id;
                const name = isLandPlot(property)
                  ? property.plotNumber
                  : property.houseNumber;
                const size = property.landArea || property.houseArea;
                const price = isLandPlot(property)
                  ? property.totalPrice
                  : property.housePrice;

                return (
                  <Col xs={24} sm={12} md={12} lg={6} key={id} className="mb-4">
                    <div
                      onClick={() => handleViewDetails(property)}
                      className="relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 h-full hover:shadow-lg hover:scale-[1.01]"
                    >
                      <div
                        className={`${
                          gradients[idx % gradients.length]
                        } p-4 relative overflow-hidden border border-gray-200 h-full`}
                      >
                        {/* Pattern - like ProjectSelectionPage */}
                        <div className="absolute inset-0 opacity-5">
                          <div className="absolute top-0 right-0 w-40 h-40 bg-gray-400 rounded-full -translate-y-1/2 translate-x-1/2" />
                          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gray-400 rounded-full translate-y-1/2 -translate-x-1/2" />
                        </div>

                        {/* Icon/Image Area */}
                        <div className="relative z-10 mb-3">
                          <div className="bg-blue-600 p-3 rounded-xl shadow-md w-fit">
                            {isLand ? (
                              <MapPin className="w-8 h-8 text-white" />
                            ) : (
                              <Home className="w-8 h-8 text-white" />
                            )}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="relative z-10 text-gray-800">
                          <h3 className="text-lg font-bold mb-2 line-clamp-1">
                            {isLand ? `ແປງດິນ ${name}` : `ເຮືອນ ${name}`}
                          </h3>

                          <div className="flex items-start gap-2 mb-3">
                            <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-gray-600" />
                            <span className="text-xs text-gray-700 leading-relaxed">
                              {selectedZone?.zoneName} •{" "}
                              {selectedProject?.projectName}
                            </span>
                          </div>

                          {/* Property Details Grid */}
                          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-300">
                            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-2 border border-gray-200">
                              <div className="flex items-center gap-1 mb-0.5">
                                <Maximize2 className="w-3 h-3 text-gray-600" />
                                <span className="text-xs text-gray-600">
                                  ເນື້ອທີ່
                                </span>
                              </div>
                              <p className="font-bold text-sm text-gray-800">
                                {size?.toLocaleString() || 0} ຕ.ມ
                              </p>
                            </div>

                            {isLandPlot(property) &&
                            property.plotWidth &&
                            property.plotLength ? (
                              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-2 border border-gray-200">
                                <div className="flex items-center gap-1 mb-0.5">
                                  <Layers className="w-3 h-3 text-gray-600" />
                                  <span className="text-xs text-gray-600">
                                    ຂະໜາດ
                                  </span>
                                </div>
                                <p className="font-bold text-sm text-gray-800">
                                  {property.plotWidth}×{property.plotLength} ມ
                                </p>
                              </div>
                            ) : !isLandPlot(property) &&
                              property.bedrooms !== undefined ? (
                              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-2 border border-gray-200">
                                <div className="flex items-center gap-1 mb-0.5">
                                  <BedDouble className="w-3 h-3 text-gray-600" />
                                  <span className="text-xs text-gray-600">
                                    ຫ້ອງນອນ
                                  </span>
                                </div>
                                <p className="font-bold text-sm text-gray-800">
                                  {property.bedrooms} ຫ້ອງ
                                </p>
                              </div>
                            ) : null}
                          </div>

                          {/* Price */}
                          <div className="mt-4 pt-3 border-t border-gray-300">
                            <div className="text-xs text-gray-600">
                              ລາຄາເລີ່ມຕົ້ນ
                            </div>
                            <p className="font-bold text-lg text-gray-800">
                              ${price?.toLocaleString() || 0}
                            </p>
                          </div>
                        </div>

                        {/* Status Tag */}
                        <div className="absolute top-4 right-4 z-10">
                          <Tag color="green" size="sm">
                            ຍັງວ່າງ
                          </Tag>
                        </div>

                        {/* Arrow - like ProjectSelectionPage */}
                        <div className="absolute bottom-4 right-4 z-10">
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

          {/* Pagination - like ProjectSelectionPage */}
          {available.length > limit && (
            <div className="flex justify-center mt-8">
              <Pagination
                prev
                next
                first
                last
                ellipsis
                boundaryLinks
                total={totalAvailable}
                limit={limit}
                activePage={page}
                onChangePage={setPage}
                maxButtons={5}
                size="md"
              />
            </div>
          )}

          <div className="mt-6 text-center text-sm text-gray-500">
            ສະແດງ {paginated.length} ຈາກທັງໝົດ {available.length} ລາຍການ
          </div>
        </>
      )}
    </div>
  );
};

export default PropertyListPage;

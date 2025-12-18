import React from "react";
import { Modal, Button } from "rsuite";
import { MapPin, Maximize2, DollarSign } from "lucide-react";
import type { LandPlot } from "../../../types/landPlot";

interface DetailLandPlotProps {
  landPlot: LandPlot | null;
  isOpen: boolean;
  onClose: () => void;
  onBuy: (landPlot: LandPlot) => void;
}

const DetailLandPlot: React.FC<DetailLandPlotProps> = ({
  landPlot,
  isOpen,
  onClose,
  onBuy,
}) => {
  if (!landPlot) return null;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="sm"
      backdrop={true}
      keyboard={true}
    >
      <Modal.Header>
        <Modal.Title className="text-2xl font-bold">
          ແປງດິນເລກທີ່ {landPlot.plotNumber}
        </Modal.Title>
        <div className="flex items-center gap-2 text-gray-600 mt-1">
          <MapPin className="w-4 h-4" />
          <span className="text-sm"> {landPlot.zone.zoneName}</span>
        </div>
      </Modal.Header>

      <Modal.Body className="px-0">
        {/* Key Stats */}
        <div className="grid grid-cols-4 gap-3 px-6 py-3 bg-gray-50 border-y">
          <div className="text-center">
            <Maximize2 className="w-5 h-5 text-gray-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-gray-900">
              {landPlot.landArea}
            </p>
            <p className="text-xs text-gray-600">ເນື້ອທີ່ທັງໝົດ (m2)</p>
          </div>

          {landPlot.plotWidth && (
            <div className="text-center">
              <div className="w-5 h-5 mx-auto mb-1 flex items-center justify-center">
                <span className="text-gray-600 font-bold text-sm">W</span>
              </div>
              <p className="text-xl font-bold text-gray-900">
                {landPlot.plotWidth}
              </p>
              <p className="text-xs text-gray-600">ກວ້າງ (m)</p>
            </div>
          )}

          {landPlot.plotLength && (
            <div className="text-center">
              <div className="w-5 h-5 mx-auto mb-1 flex items-center justify-center">
                <span className="text-gray-600 font-bold text-sm">L</span>
              </div>
              <p className="text-xl font-bold text-gray-900">
                {landPlot.plotLength}
              </p>
              <p className="text-xs text-gray-600">ຍາວ (m)</p>
            </div>
          )}

          {landPlot.pricePerSqm && (
            <div className="text-center">
              <DollarSign className="w-5 h-5 text-gray-600 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-900">
                {landPlot.pricePerSqm.toLocaleString()}
              </p>
              <p className="text-xs text-gray-600">ລາຄາ/m2</p>
            </div>
          )}
        </div>

        {/* Description */}
        {landPlot.notes && (
          <div className="px-6  border-b">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              ລາຍລະອຽດ
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {landPlot.notes}
            </p>
          </div>
        )}

        {/* Features */}
        <div className="px-6 pt-2">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">ລາຍລະອຽດ</h4>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-gray-800 rounded-full mt-2"></div>
              <div>
                <p className="text-xs text-gray-600 mb-0.5">ເນື້ອທີ່ທັງໝົດ</p>
                <p className="text-sm font-semibold text-gray-900">
                  {landPlot.landArea} m2
                </p>
              </div>
            </div>

            {landPlot.plotWidth && landPlot.plotLength && (
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-gray-800 rounded-full mt-2"></div>
                <div>
                  <p className="text-xs text-gray-600 mb-0.5">ຂະໜາດດິນ</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {landPlot.plotWidth} × {landPlot.plotLength} m
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-gray-800 rounded-full mt-2"></div>
              <div>
                <p className="text-xs text-gray-600 mb-0.5">ສະຖານະ</p>
                <p className="text-sm font-semibold text-gray-900">
                  {landPlot.status === "AVAILABLE"
                    ? "ພ້ອມຂາຍ"
                    : landPlot.status === "RESERVED"
                    ? "ຈອງແລ້ວ"
                    : "ຂາຍແລ້ວ"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className="bg-gray-50 border-t">
        <div className="flex items-end justify-between w-full mt-4">
          <div>
            <p className="text-xs text-gray-600 mb-1">ລາຄາທັງໝົດ</p>
            <p className="text-2xl font-bold text-gray-900">
              ${landPlot.totalPrice.toLocaleString()}
            </p>
            {landPlot.pricePerSqm && (
              <p className="text-xs text-gray-500 mt-1">
                ${landPlot.pricePerSqm.toLocaleString()} × {landPlot.landArea}{" "}
                sqm
              </p>
            )}
          </div>
          <Button
            appearance="primary"
            size="lg"
            onClick={() => onBuy(landPlot)}
          >
            ຂາຍ
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default DetailLandPlot;

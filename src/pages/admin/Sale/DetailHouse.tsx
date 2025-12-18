import React from "react";
import { Modal, Button } from "rsuite";
import { MapPin, BedDouble, Bath, Maximize2, Home } from "lucide-react";
import type { House } from "../../../types/house";

interface DetailHouseProps {
  house: House | null;
  isOpen: boolean;
  onClose: () => void;
  onBuy: (house: House) => void;
}

const DetailHouse: React.FC<DetailHouseProps> = ({
  house,
  isOpen,
  onClose,
  onBuy,
}) => {
  if (!house) return null;

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
          ເລກທີ່ເຮືອນ: {house.houseNumber}
        </Modal.Title>
        <div className="flex items-center gap-2 text-gray-600 mt-1">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">Zone {house.zoneId}</span>
        </div>
      </Modal.Header>

      <Modal.Body className="px-0">
        {/* Key Stats */}
        <div className="grid grid-cols-4 gap-3 px-6 py-3 bg-gray-50 border-y">
          <div className="text-center">
            <BedDouble className="w-5 h-5 text-gray-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-gray-900">{house.bedrooms}</p>
            <p className="text-xs text-gray-600">ຫ້ອງນອນ</p>
          </div>

          <div className="text-center">
            <Bath className="w-5 h-5 text-gray-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-gray-900">{house.bathrooms}</p>
            <p className="text-xs text-gray-600">ຫ້ອງນ້ຳ</p>
          </div>

          <div className="text-center">
            <Home className="w-5 h-5 text-gray-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-gray-900">
              {house.parkingSpaces}
            </p>
            <p className="text-xs text-gray-600">ບ່ອນຈອດ</p>
          </div>

          <div className="text-center">
            <Maximize2 className="w-5 h-5 text-gray-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-gray-900">{house.landArea}</p>
            <p className="text-xs text-gray-600">ເນື້ອທີ່ທັງໝົດ (ຕ.ມ)</p>
          </div>
        </div>

        {/* Description */}
        {house.description && (
          <div className="px-6 py-2 border-b">
            <h4 className="text-lg font-semibold text-gray-900 ">ລາຍລະອຽດ</h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              {house.description}
            </p>
          </div>
        )}

        {/* Features */}
        <div className="px-6 py-2 border-b">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            ຄຸນລັກສະນະ
          </h4>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-gray-800 rounded-full mt-2"></div>
              <div>
                <p className="text-xs text-gray-600 mb-0.5">ປະເພດເຮືອນ</p>
                <p className="text-sm font-semibold text-gray-900">
                  {house.houseType}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-gray-800 rounded-full mt-2"></div>
              <div>
                <p className="text-xs text-gray-600 mb-0.5">ຈຳນວນຊັ້ນ</p>
                <p className="text-sm font-semibold text-gray-900">
                  {house.totalFloors} ຊັ້ນ
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-gray-800 rounded-full mt-2"></div>
              <div>
                <p className="text-xs text-gray-600 mb-0.5">ເນື້ອທີ່ບ້ານ</p>
                <p className="text-sm font-semibold text-gray-900">
                  {house.builtArea} ຕ.ມ
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-gray-800 rounded-full mt-2"></div>
              <div>
                <p className="text-xs text-gray-600 mb-0.5">ເນື້ອທີ່ໃຊ້ສອຍ</p>
                <p className="text-sm font-semibold text-gray-900">
                  {house.usableArea} ຕ.ມ
                </p>
              </div>
            </div>

            {house.buildYear && (
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-gray-800 rounded-full mt-2"></div>
                <div>
                  <p className="text-xs text-gray-600 mb-0.5">ປີທີ່ສ້າງ</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {house.buildYear}
                  </p>
                </div>
              </div>
            )}

            {house.houseDirection && (
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-gray-800 rounded-full mt-2"></div>
                <div>
                  <p className="text-xs text-gray-600 mb-0.5">ທິດທາງເຮືອນ</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {house.houseDirection}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-gray-800 rounded-full mt-2"></div>
              <div>
                <p className="text-xs text-gray-600 mb-0.5">ສະຖານະ</p>
                <p className="text-sm font-semibold text-gray-900">
                  {house.status === "AVAILABLE"
                    ? "ພ້ອມຂາຍ"
                    : house.status === "RESERVED"
                    ? "ຈອງແລ້ວ"
                    : "ຂາຍແລ້ວ"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className="bg-gray-50 ">
        <div className="flex items-end justify-between w-full">
          <div>
            <p className="text-xs text-gray-600 mb-1">ລາຄາເຮືອນ</p>
            <p className="text-2xl font-bold text-gray-900">
              ${house.housePrice.toLocaleString()}
            </p>
          </div>
          <Button
            appearance="primary"
            size="lg"
            onClick={() => onBuy(house)}
            style={{ backgroundColor: "#a0522d", borderColor: "#a0522d" }}
          >
            ສັ່ງຊື້
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default DetailHouse;

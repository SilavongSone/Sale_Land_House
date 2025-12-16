import React from "react";
import { Modal, Button } from "rsuite";
import { X, MapPin, BedDouble, Bath, Maximize2, Calendar } from "lucide-react";
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
      size="md"
      backdrop="static"
      className="detail-house-modal"
    >
      <Modal.Body className="p-0">
        <div className="bg-white">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b">
            <button
              onClick={onClose}
              className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {house.houseNumber}
            </h2>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">Zone {house.zoneId}</span>
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-4 gap-4 p-6 bg-gray-50">
            {house.bedrooms !== undefined && (
              <div className="text-center">
                <BedDouble className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{house.bedrooms}</p>
                <p className="text-xs text-gray-600 mt-1">ຫ້ອງນອນ</p>
              </div>
            )}
            
            {house.bathrooms !== undefined && (
              <div className="text-center">
                <Bath className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{house.bathrooms}</p>
                <p className="text-xs text-gray-600 mt-1">ຫ້ອງນ້ຳ</p>
              </div>
            )}

              <div className="text-center">
                <Bath className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{house.parkingSpaces}</p>
                <p className="text-xs text-gray-600 mt-1">ບ່ອນຈອດລົດ</p>
              </div>
            
            
            <div className="text-center">
              <Maximize2 className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{house.landArea}</p>
              <p className="text-xs text-gray-600 mt-1">ເນື້ອທີ່ (sqm)</p>
            </div>

            {house.buildYear && (
              <div className="text-center">
                <Calendar className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{house.buildYear}</p>
                <p className="text-xs text-gray-600 mt-1">ປີທີ່ສ້າງ</p>
              </div>
            )}
          </div>

          {/* Description */}
          {house.description && (
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900 mb-3">ລາຍລະອຽດ</h3>
              <p className="text-gray-700 leading-relaxed">
                {house.description}
              </p>
            </div>
          )}

          {/* Features */}
          <div className="p-6 border-b">
            <h3 className="text-xl font-bold text-gray-900 mb-4">ຄຸນລັກສະນະ</h3>
            <div className="grid grid-cols-2 gap-3">
              {house.houseType && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gray-800 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900">ປະເພດເຮືອນ</p>
                    <p className="text-sm text-gray-600">{house.houseType}</p>
                  </div>
                </div>
              )}
              
              {house.totalFloors && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gray-800 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900">ຈຳນວນຊັ້ນ</p>
                    <p className="text-sm text-gray-600">{house.totalFloors} ຊັ້ນ</p>
                  </div>
                </div>
              )}

              {house.builtArea && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gray-800 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900">ເນື້ອທີ່ກໍ່ສ້າງ</p>
                    <p className="text-sm text-gray-600">{house.builtArea} sqm</p>
                  </div>
                </div>
              )}

              {house.usableArea && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gray-800 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900">ເນື້ອທີ່ໃຊ້ສອຍ</p>
                    <p className="text-sm text-gray-600">{house.usableArea} sqm</p>
                  </div>
                </div>
              )}
              
              {house.parkingSpaces > 0 && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gray-800 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900">ທີ່ຈອດລົດ</p>
                    <p className="text-sm text-gray-600">{house.parkingSpaces} ຄັນ</p>
                  </div>
                </div>
              )}

              {house.houseDirection && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gray-800 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900">ທິດທາງເຮືອນ</p>
                    <p className="text-sm text-gray-600">{house.houseDirection}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Project Details */}
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">ລາຍລະອຽດໂຄງການ</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">ລະຫັດເຮືອນ</p>
                <p className="font-semibold text-gray-900">{house.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">ເລກທີ່ເຮືອນ</p>
                <p className="font-semibold text-gray-900">{house.houseNumber}</p>
              </div>
            </div>
          </div>

          {/* Price Footer */}
          <div className="px-6 pb-6 pt-4 bg-gray-50 border-t">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">ລາຄາເຮືອນ</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${house.housePrice.toLocaleString()}
                </p>
              </div>
              <Button
                appearance="primary"
                size="lg"
                onClick={() => onBuy(house)}
                className="px-8 py-3 rounded-xl"
                style={{ backgroundColor: '#a0522d', borderColor: '#a0522d' }}
              >
                ສອບຖາມລາຍລະອຽດ
              </Button>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default DetailHouse;
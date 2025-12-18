export type HouseType = "SINGLE" | "TOWNHOUSE" | "VILLA" | "DETACHED";
export type FurnitureStatus = "FULL" | "PARTIAL" | "NONE";
export type HouseStatus = "AVAILABLE" | "SOLD" | "RESERVED";

export interface Facilities {
  swimmingPool: boolean;
  garden: boolean;
  airConditioning: boolean;
}

export interface FormValue {
  projectId: number | null;
  zoneId: number | null;
  houseNumber: string;
  houseType: HouseType;
  landArea: number;
  builtArea: number;
  usableArea: number;
  totalFloors: number;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  housePrice: number;
  buildYear: number | null;
  houseDirection: string;
  description: string;
  status: HouseStatus;
}
export interface FetchHousesParams {
  page?: number;
  limit?: number;
  search?: string;
  projectId?: string;
  zoneId?: string;
  status?: string;
  orderBy?: string;
  order?: "ASC" | "DESC";
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface HouseResponse {
  data: House[];
  pagination: PaginationMeta;
}

export interface HouseStore {
  houses: House[];
  selectedHouse: House | null;
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;

  fetchHouses: (params?: FetchHousesParams) => Promise<void>;
  createHouse: (data: HouseCreateInput) => Promise<House>;
  updateHouse: (id: string | number, data: HouseUpdateInput) => Promise<House>;
  deleteHouse: (id: string | number) => Promise<boolean>;
  fetchHouseById: (id: string | number) => Promise<House>;
  getHousesByZone: (zoneId: string | number) => House[];
  setSelectedHouse: (house: House | null) => void;
  clearError: () => void;
  reset: () => void;
}

export interface House {
  houseArea: any;
  id: string | number;
  zoneId: string | number;
  houseNumber: string;
  houseType: HouseType;
  landArea: number;
  builtArea: number;
  usableArea: number;
  totalFloors: number;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  housePrice: number;
  buildYear?: number | null;
  houseDirection?: string | null;
  description?: string | null;
  status: HouseStatus;
  createdAt: string;
  updatedAt: string;

  zone?: { id: string | number; zoneName: string };
  sales?: any[];
  maintenances?: any[];
}



export interface HouseCreateInput {
  zoneId: string | number;
  houseNumber: string;
  houseType: HouseType;
  landArea: number | string;
  builtArea: number | string;
  usableArea: number | string;
  totalFloors: number | string;
  bedrooms: number | string;
  bathrooms: number | string;
  parkingSpaces?: number | string;
  housePrice: number | string;
  buildYear?: number | string | null;
  houseDirection?: string | null;
  description?: string | null;
  status?: HouseStatus;
}

export type HouseUpdateInput = Partial<HouseCreateInput>;
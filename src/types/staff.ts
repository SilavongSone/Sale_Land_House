
interface Province {
  provinceId: number;
  provinceName: string;
}

interface District {
  districtId: number;
  provinceId: number;
  districtName: string;
  province?: Province;
}

export interface Staff {
  staffId: number;
  staffCode: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  village?: string;
  districtId: number;
  position: string;
  hireDate?: string;
  department?: string;
  basicSalary: number | string | null;
  commissionRate?: number | string;
  notes?: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
}

export interface StaffCreateInput {
  staffCode: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  village?: string;
  districtId: number;
  position: string;
  department?: string;
  basicSalary: number;
  commissionRate?: number;
  notes?: string;
  status?: "ACTIVE" | "INACTIVE";
}

export interface StaffUpdateInput extends Partial<StaffCreateInput> {}

export interface FetchStaffParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface StaffResponse {
  data: Staff[];
  total: number;
  page: number;
  limit: number;
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export interface StaffStore {
  staffs: Staff[];
  selectedStaff: Staff | null;
  pagination: any;
  isLoading: boolean;
  error: string | null;

  fetchStaffs: (params?: any) => Promise<void>;
  fetchStaffById: (id: string | number) => Promise<void>;
  createStaff: (data: StaffCreateInput) => Promise<Staff>;
  updateStaff: (id: string | number, data: StaffUpdateInput) => Promise<Staff>;
  deleteStaff: (id: string | number) => Promise<void>;

  setSelectedStaff: (staff: Staff | null) => void;
  clearError: () => void;
  reset: () => void;
}
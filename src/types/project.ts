
export type ProjectStatus = "ACTIVE" | "INACTIVE";

export interface Province {
  provinceId: number;
  provinceName: string;
}

export interface District {
  districtId: number;
  districtName: string;
  provinceId: number;
  province?: Province;
}


export interface Zone {
  zoneId: number;
  zoneName: string;
  projectId: number;
}

export interface Expense {
  expenseId: number;
  amount: number;
  description: string;
  projectId: number;
  createdAt: string;       // ISO string
}


// =========================
// Project Area
// =========================
export interface ProjectAreaItem {
  zoneId?: number;
  projectId: number;
  totalLandArea: number;
  zoneName?: string; 
}


// =========================
// Project Entity
// =========================
export interface Project {
  projectId: number;
  projectName: string;
  totalLandArea: number;
  totalWidth: number;
  totalLength: number;
  village: string;
  districtId: number;
  landOwnerName: string;
  landOwnerPhone: string;
  price: number;
  description?: string;
  status: ProjectStatus;
  createdAt: string | Date;
  updatedAt: string | Date;

  district?: District;
  zones?: Zone[];
  expenses?: Expense[];
}


// =========================
// API Params
// =========================
export interface FetchProjectsParams {
  page?: number;
  limit?: number;
  search?: string;
  provinceId?: number;     
  districtId?: number;    
  status?: ProjectStatus;
  orderBy?: string;
  order?: "ASC" | "DESC";
}


// =========================
// API Responses
// =========================
export interface PaginationInfo {
  total: number;
  page: number;
  skip: number;
  limit: number;
  totalPages: number;
}

export interface ProjectsResponse {
  data: Project[];
  pagination: PaginationInfo;
}

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  inactiveProjects: number;
  totalLandArea: number;
  totalPrice: number;
}


// =========================
// Store Interface
// =========================
export interface ProjectStore {
  projects: Project[];
  projectOptions: Project[];               
  selectedProject: Project | null;
  pagination: PaginationInfo | null;

  isLoading: boolean;
  error: string | null;

  fetchProjects: (params?: FetchProjectsParams) => Promise<void>;
  fetchProjectOptions: () => Promise<void>;
  fetchProjectById: (id: number | string) => Promise<void>;
  createProject: (data: Partial<Project>) => Promise<void>;
  updateProject: (id: number | string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: number | string) => Promise<void>;

  setSelectedProject: (project: Project | null) => void;
  clearError: () => void;
  reset: () => void;
}

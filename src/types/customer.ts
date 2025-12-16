

export interface CustomerAttributes {
  customerId: number | string;
  customerCode: string;
  firstName: string;
  lastName: string;
  gender?: string;
  dateOfBirth?: string | Date;
  idCard?: string;
  phone: string;
  email?: string;
  village?: string;
  districtId?: number;
  status?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
  
  // Relations
  district?: {
    districtId: number;
    districtName: string;
    province?: {
      provinceId: number;
      provinceName: string;
    };
  };
  sales?: any[];
  maintenances?: any[];
}

export interface CustomerCreateInput {
  customerCode: string;
  firstName: string;
  lastName: string;
  gender?: string;
  dateOfBirth?: string;
  idCard?: string;
  phone: string;
  email?: string;
  village?: string;
  districtId?: number;
  status?: string;
  notes?: string;
}

export interface CustomerQueryParams {
  page?: number;
  limit?: number;
  orderBy?: string;
  order?: "ASC" | "DESC";
  customerCode?: string;
  gender?: string;
  status?: string;
  provinceId?: string;
  districtId?: string;
}

export interface CustomerResponse {
  data: CustomerAttributes[];
  pagination:{
    page: number;
    limit: number;
    total: number
  }
}
export interface DistrictAttributes {
  id: string;
  provinceId: string;
  districtName: string;
  villages: string[]; // ควร default เป็น [] ใน frontend
  createdAt: string;
  updatedAt: string;
}

export interface DistrictCreateInput {
  provinceId: string;
  districtName: string;
}

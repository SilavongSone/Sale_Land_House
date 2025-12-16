export interface District {
  districtId: number;
  districtName: string;
  provinceId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProvinceAttributes {
  provinceId: number;
  provinceName: string;
  createdAt: Date;
  updatedAt: Date;
  districts: District[];

}

export interface PaginationParams {
  page?: number;
  limit?: number;
  orderBy?: string;
  order?: "ASC" | "DESC" ;
  [key: string]: any; 
}

export const Pagination = (params: Record<string, any> = {}) => {
  const { page = 1, limit = 10, orderBy = "createdAt", order = "DESC", ...filters } = params;


  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v !== undefined && v !== null && v !== "")
  );

  return { page, limit, orderBy, order, ...cleanFilters };
};

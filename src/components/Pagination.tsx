import { Pagination as RSuitePagination } from "rsuite";

interface PaginationProps {
  total: number;
  limit: number;
  page: number;
  onPageChange: (page: number) => void;
  className?: string;
  showInfo?: boolean;
  maxButtons?: number;
  size?: "lg" | "md" | "sm" | "xs";
}

const Pagination = ({ 
  total, 
  limit, 
  page, 
  onPageChange,
  className = "",
  showInfo = true,
  maxButtons = 5,
  size = "sm"
}: PaginationProps) => {
  const totalPages = Math.ceil(total / limit);

  const startIndex = total === 0 ? 0 : (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, total);

  // Don't render pagination if there's only one page or no data
  if (totalPages <= 1 && total === 0) {
    return null;
  }

  return (
    <div className={`flex flex-col sm:flex-row justify-between items-center mt-2 border-gray-200 gap-2 ${className}`}>
      {/* Left: Showing info */}
      {showInfo && (
        <div className="text-sm text-gray-600">
          {total > 0 ? (
            <>ສະແດງ {startIndex} ຫາ {endIndex} ຈາກ {total} ລາຍການ</>
          ) : (
            <>ບໍ່ມີຂໍ້ມູນ</>
          )}
        </div>
      )}

      {/* Right: Pagination - only show if there's more than 1 page */}
      {totalPages > 1 && (
        <RSuitePagination
          prev
          next
          first
          last
          ellipsis
          boundaryLinks
          total={total}
          limit={limit}
          activePage={page}
          onChangePage={onPageChange}
          maxButtons={maxButtons}
          size={size}
          layout={["pager"]}
        />
      )}
    </div>
  );
};

export default Pagination;
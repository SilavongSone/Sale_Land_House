import { Placeholder } from "rsuite";
import type { CSSProperties, FC } from "react";

export interface TableSkeletonLoaderProps {
  rows?: number;
  columns?: number;
  rowHeight?: number;
}

const loaderContainerStyle: CSSProperties = {
  position: "absolute",
  width: "100%",
  height: "100%",
  background: "var(--rs-bg-card)",
  padding: 20,
  zIndex: 1,
  top: 0,
  left: 0,
};

export const TableSkeletonLoader: FC<TableSkeletonLoaderProps> = ({
  rows = 12,
  columns = 6,
  rowHeight = 10,
}) => {
  return (
    <div style={loaderContainerStyle}>
      <Placeholder.Grid
        rows={rows}
        columns={columns}
        rowHeight={rowHeight}
        active
      />
    </div>
  );
};

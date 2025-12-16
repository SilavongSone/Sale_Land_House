import { useMemo, useCallback } from "react";
import { Table, IconButton, Loader, Tag } from "rsuite";
import EditIcon from "@rsuite/icons/Edit";
import TrashIcon from "@rsuite/icons/Trash";

import { formatCurrencyKib,formatArea  } from "../../../utils/formatters/formatn-number";

import type { LandPlot } from "../../../types/landPlot";
import type { Project } from "../../../types/project";

const { Column, HeaderCell, Cell } = Table;

interface LandPlotTableProps {
  landPlots: LandPlot[];
  projects: Project[];
  loading: boolean;
  onEdit: (landPlot: LandPlot) => void;
  onDelete: (landPlot: LandPlot) => void;
  limit: number;
  page: number;
  onLimitChange: (limit: number) => void;
  searchKeyword: string;
  onSearchChange: (keyword: string) => void;
  sortColumn: string;
  sortType: "ASC" | "DESC";
  onSort: (column: string, type: "ASC" | "DESC") => void;
}

// Status configurations
const STATUS_CONFIG = {
  AVAILABLE: { label: "ວ່າງ", color: "green" as const },
  SOLD: { label: "ຂາຍແລ້ວ", color: "red" as const },
  RESERVED: { label: "ຈອງແລ້ວ", color: "orange" as const },
} as const;

const LandPlotTable = ({
  landPlots,
  projects,
  loading,
  limit,
  page,
  onEdit,
  onDelete,
  sortColumn,
  sortType,
  onSort,
}: LandPlotTableProps) => {
  // Extract all zones from projects
  const allZones = useMemo(() => {
    return projects.flatMap((project) =>
      (project.zones || []).map((zone: any) => ({
        ...zone,
        projectId: project.projectId,
      }))
    );
  }, [projects]);

  // Create lookup maps for better performance
  const zoneMap = useMemo(
    () => new Map(allZones.map((z) => [z.zoneId, z])),
    [allZones]
  );

  const projectMap = useMemo(
    () => new Map(projects.map((p) => [p.projectId, p])),
    [projects]
  );

  const handleSortColumn = useCallback(
    (column: string, type?: "asc" | "desc") => {
      const upperSortType = type?.toUpperCase() === "ASC" ? "ASC" : "DESC";
      onSort(column, upperSortType);
    },
    [onSort]
  );

  const getZoneName = useCallback(
    (zoneId: number) => zoneMap.get(zoneId)?.zoneName || "-",
    [zoneMap]
  );

  const getProjectName = useCallback(
    (projectId: number) => projectMap.get(projectId)?.projectName || "-",
    [projectMap]
  );

  const getStatusLabel = useCallback(
    (status: string) =>
      STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label || status,
    []
  );

  const getStatusColor = useCallback(
    (status: string) =>
      STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.color || "blue",
    []
  );

  const getRowNumber = useCallback(
    (rowIndex: number) => (page - 1) * limit + rowIndex + 1,
    [page, limit]
  );

  const renderRowNumber = useCallback(
    (_rowData: any, rowIndex?: number) => getRowNumber(rowIndex ?? 0),
    [getRowNumber]
  );

  const renderProjectName = useCallback(
    (rowData: LandPlot) => {
      const zone = zoneMap.get(rowData.zoneId);
      return zone ? getProjectName(zone.projectId) : "-";
    },
    [zoneMap, getProjectName]
  );

  const renderZoneName = useCallback(
    (rowData: LandPlot) => getZoneName(rowData.zoneId),
    [getZoneName]
  );

  const renderLandArea = useCallback(
    (rowData: LandPlot) => formatArea(rowData.landArea),
    []
  );

  const renderDimension = useCallback(
    (value?: number) => (value ? formatArea(value) : "-"),
    []
  );

  const renderPricePerSqm = useCallback(
    (rowData: LandPlot) => (
      <span className="font-medium text-blue-600">
        {formatCurrencyKib(rowData.pricePerSqm)}
      </span>
    ),
    []
  );

  const renderTotalPrice = useCallback(
    (rowData: LandPlot) => (
      <span className="font-semibold text-blue-700">
        {formatCurrencyKib(rowData.totalPrice)}
      </span>
    ),
    []
  );

  const renderLandTitle = useCallback(
    (rowData: LandPlot) => (
      <div className="text-xs">
        {(rowData as any).hasLandTitle ? (
          <>
            {rowData.landTitleNumber && (
              <div className="text-gray-600 text-xs">
                {rowData.landTitleNumber}
              </div>
            )}
          </>
        ) : (
          <div className="text-red-600">✗ ບໍ່ມີໃບຕາດິນ</div>
        )}
      </div>
    ),
    []
  );

  const renderStatus = useCallback(
    (rowData: LandPlot) => (
      <Tag color={getStatusColor(rowData.status)} size="sm">
        {getStatusLabel(rowData.status)}
      </Tag>
    ),
    [getStatusColor, getStatusLabel]
  );

  const renderCreatedDate = useCallback(
    (rowData: LandPlot) =>
      new Date(rowData.createdAt).toLocaleDateString("en-GB"),
    []
  );

  const renderActions = useCallback(
    (rowData: LandPlot) => (
      <div className="flex gap-2 justify-center">
        <IconButton
          size="xs"
          icon={<EditIcon />}
          appearance="primary"
          color="blue"
          onClick={() => onEdit(rowData)}
        />
        <IconButton
          size="xs"
          icon={<TrashIcon />}
          appearance="primary"
          color="red"
          onClick={() => onDelete(rowData)}
        />
      </div>
    ),
    [onEdit, onDelete]
  );

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
          <Loader size="md" content="ກຳລັງໂຫຼດ..." />
        </div>
      )}

      <Table
        autoHeight
        maxHeight={510}
        data={landPlots}
        sortColumn={sortColumn}
        sortType={sortType === "ASC" ? "asc" : "desc"}
        onSortColumn={handleSortColumn}
        bordered
        cellBordered
        hover
      >
        <Column width={50} align="center" fixed>
          <HeaderCell>#</HeaderCell>
          <Cell>{renderRowNumber}</Cell>
        </Column>

        <Column width={70}>
          <HeaderCell>ເລກທີ່ແປ່ນ</HeaderCell>
          <Cell dataKey="plotNumber" />
        </Column>

        <Column width={180}>
          <HeaderCell>ຊື່ໂຄງການ</HeaderCell>
          <Cell>{renderProjectName}</Cell>
        </Column>

        <Column width={100}>
          <HeaderCell>ໂຊນ</HeaderCell>
          <Cell>{renderZoneName}</Cell>
        </Column>

        <Column width={120} align="right">
          <HeaderCell>ເນື້ອທີ່ (m²)</HeaderCell>
          <Cell>{renderLandArea}</Cell>
        </Column>

        <Column width={80} align="center">
          <HeaderCell>ກວ້າງ (m)</HeaderCell>
          <Cell>
            {(rowData: LandPlot) => {
              const dimension =
                rowData.plotWidth !== null && rowData.plotWidth !== undefined
                  ? renderDimension(rowData.plotWidth)
                  : null;
              return dimension;
            }}
          </Cell>
        </Column>

        <Column width={80} align="center">
          <HeaderCell>ຍາວ (m)</HeaderCell>
          <Cell>
            {(rowData: LandPlot) => {
              const length =
                rowData.plotLength !== null && rowData.plotLength !== undefined
                  ? renderDimension(rowData.plotLength)
                  : null;
              return length;
            }}
          </Cell>
        </Column>

        <Column width={100} align="right">
          <HeaderCell>ລາຄາ/m²</HeaderCell>
          <Cell>{renderPricePerSqm}</Cell>
        </Column>

        <Column width={180} align="right">
          <HeaderCell>ລາຄາລວມ</HeaderCell>
          <Cell>{renderTotalPrice}</Cell>
        </Column>

        <Column width={140}>
          <HeaderCell>ໃບຕາດິນ</HeaderCell>
          <Cell>{renderLandTitle}</Cell>
        </Column>

        <Column width={110} align="center">
          <HeaderCell>ສະຖານະ</HeaderCell>
          <Cell>{renderStatus}</Cell>
        </Column>

        <Column width={120}>
          <HeaderCell>ວັນທີ່ສ້າງ</HeaderCell>
          <Cell>{renderCreatedDate}</Cell>
        </Column>

        <Column width={100} fixed="right" align="center">
          <HeaderCell>ຈັດການ</HeaderCell>
          <Cell>{renderActions}</Cell>
        </Column>
      </Table>
    </div>
  );
};

export default LandPlotTable;
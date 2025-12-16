import { Table, IconButton, Loader, Tag } from "rsuite";
import EditIcon from "@rsuite/icons/Edit";
import TrashIcon from "@rsuite/icons/Trash";
import { formatArea,formatCurrencyKib } from "../../../utils/formatters/formatn-number";
import type { House } from "../../../types/house";

const { Column, HeaderCell, Cell } = Table;

interface HouseTableProps {
  houses: House[];
  projects: any[];
  loading: boolean;
  onEdit: (house: House) => void;
  onDelete: (house: House) => void;
  limit: number;
  page: number;
  onLimitChange: (limit: number) => void;
  searchKeyword: string;
  onSearchChange: (keyword: string) => void;
  sortColumn: string;
  sortType: "ASC" | "DESC";
  onSort: (column: string, type: "ASC" | "DESC") => void;
}

const HouseTable = ({
  houses,
  projects,
  loading,
  limit,
  page,
  onEdit,
  onDelete,
  sortColumn,
  sortType,
  onSort,
}: HouseTableProps) => {
  const handleSortColumn = (column: string, type?: "asc" | "desc") => {
    const sortType = type?.toUpperCase() === "ASC" ? "ASC" : "DESC";
    onSort(column, sortType);
  };


  // Get zone name by ID from projects
  const getZoneName = (zoneId: string | number) => {
    for (const project of projects) {
      const zone = project.zones?.find((z: any) => z.zoneId === Number(zoneId));
      if (zone) return zone.zoneName;
    }
    return "-";
  };

  // Map house type to Lao
  const getHouseTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      SINGLE: "ເຮືອນດຽວ",
      TOWNHOUSE: "ທາວເຮົ້າ",
      VILLA: "ວິນລ່າ",
    };
    return typeMap[type] || type;
  };

  // Map status to Lao
  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      AVAILABLE: "ວ່າງ",
      SOLD: "ຂາຍແລ້ວ",
      RESERVED: "ຈອງແລ້ວ",
    };
    return statusMap[status] || status;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    const colorMap: Record<string, "green" | "red" | "orange"> = {
      AVAILABLE: "green",
      SOLD: "red",
      RESERVED: "orange",
    };
    return colorMap[status] || "blue";
  };

  return (
    <div>
      {/* Table */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        {loading && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255, 255, 255, 0.8)",
              zIndex: 10,
            }}
          >
            <Loader size="md" content="ກຳລັງໂຫຼດ..." />
          </div>
        )}

        <Table
          autoHeight
          maxHeight={500}
          data={houses}
          sortColumn={sortColumn}
          sortType={sortType === "ASC" ? "asc" : "desc"}
          onSortColumn={handleSortColumn}
          bordered
          cellBordered
          hover
        >
          <Column width={50} align="center" fixed>
            <HeaderCell>#</HeaderCell>
            <Cell>
              {(_rowData: any, rowIndex?: number) =>
                (page - 1) * limit + (rowIndex ?? 0) + 1
              }
            </Cell>
          </Column>

          <Column width={130}>
            <HeaderCell>ເລກທີ່ເຮືອນ</HeaderCell>
            <Cell dataKey="houseNumber" />
          </Column>

          <Column width={150}>
            <HeaderCell>ໂຊນ</HeaderCell>
            <Cell>
              {(rowData: House) => getZoneName(rowData.zoneId)}
            </Cell>
          </Column>

          <Column width={120}>
            <HeaderCell>ປະເພດ</HeaderCell>
            <Cell>
              {(rowData: House) => getHouseTypeLabel(rowData.houseType)}
            </Cell>
          </Column>

          <Column width={120} align="right">
            <HeaderCell>ເນື້ອທີ່ດິນ (m²)</HeaderCell>
            <Cell>{(rowData: House) => formatArea(rowData.landArea)}</Cell>
          </Column>

          <Column width={120} align="right">
            <HeaderCell>ພື້ນທີ່ກໍ່ສ້າງ (m²)</HeaderCell>
            <Cell>{(rowData: House) => formatArea(rowData.builtArea)}</Cell>
          </Column>

          <Column width={120} align="right">
            <HeaderCell>ພື້ນທີ່ໃຊ້ສອຍ (m²)</HeaderCell>
            <Cell>{(rowData: House) => formatArea(rowData.usableArea)}</Cell>
          </Column>

          <Column width={90} align="center">
            <HeaderCell>ຊັ້ນ</HeaderCell>
            <Cell dataKey="totalFloors" />
          </Column>

          <Column width={90} align="center">
            <HeaderCell>ຫ້ອງນອນ</HeaderCell>
            <Cell dataKey="bedrooms" />
          </Column>

          <Column width={90} align="center">
            <HeaderCell>ຫ້ອງນ້ຳ</HeaderCell>
            <Cell dataKey="bathrooms" />
          </Column>

          <Column width={100} align="center">
            <HeaderCell>ທີ່ຈອດລົດ</HeaderCell>
            <Cell dataKey="parkingSpaces" />
          </Column>

          <Column width={160} align="right">
            <HeaderCell>ລາຄາເຮືອນ</HeaderCell>
            <Cell>
              {(rowData: House) => (
                <span style={{ fontWeight: 500, color: "#1675e0" }}>
                  {formatCurrencyKib(rowData.housePrice)}
                </span>
              )}
            </Cell>
          </Column>

          <Column width={110} align="center">
            <HeaderCell>ປີທີ່ສ້າງ</HeaderCell>
            <Cell>{(rowData: House) => rowData.buildYear || "-"}</Cell>
          </Column>

          <Column width={120}>
            <HeaderCell>ທິດເຮືອນ</HeaderCell>
            <Cell>{(rowData: House) => rowData.houseDirection || "-"}</Cell>
          </Column>

          <Column width={110} align="center">
            <HeaderCell>ສະຖານະ</HeaderCell>
            <Cell>
              {(rowData: House) => (
                <Tag color={getStatusColor(rowData.status)} size="sm">
                  {getStatusLabel(rowData.status)}
                </Tag>
              )}
            </Cell>
          </Column>

          <Column width={120}>
            <HeaderCell>ວັນທີ່ສ້າງ</HeaderCell>
            <Cell>
              {(rowData: House) =>
                new Date(rowData.createdAt).toLocaleDateString("en-GB")
              }
            </Cell>
          </Column>

          <Column width={100} fixed="right" align="center">
            <HeaderCell>ຈັດການ</HeaderCell>
            <Cell>
              {(rowData: House) => (
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    justifyContent: "center",
                  }}
                >
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
              )}
            </Cell>
          </Column>
        </Table>
      </div>
    </div>
  );
};

export default HouseTable;
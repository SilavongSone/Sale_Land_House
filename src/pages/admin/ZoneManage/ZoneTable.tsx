import { Table, IconButton, Loader, Tag } from "rsuite";
import EditIcon from "@rsuite/icons/Edit";
import TrashIcon from "@rsuite/icons/Trash";
import { formatArea, formatCurrencyKib } from "../../../utils/formatters/formatn-number";


import type { Zone } from "../../../types/zone";

const { Column, HeaderCell, Cell } = Table;

interface ZoneTableProps {
  zones: Zone[];
  loading: boolean;
  onEdit: (zone: Zone) => void;
  onDelete: (zone: Zone) => void;
  limit: number;
  page: number;
  onLimitChange: (limit: number) => void;
  searchKeyword: string;
  onSearchChange: (keyword: string) => void;
  sortColumn: string;
  sortType: "ASC" | "DESC";
  onSort: (column: string, type: "ASC" | "DESC") => void;
}

const ZoneTable = ({
  zones,
  loading,
  limit,
  page,
  onEdit,
  onDelete,
  sortColumn,
  sortType,
  onSort,
}: ZoneTableProps) => {
  const handleSortColumn = (column: string, type?: "asc" | "desc") => {
    const sortType = type?.toUpperCase() === "ASC" ? "ASC" : "DESC";
    onSort(column, sortType);
  };

  // Map zone type to Lao
  const getZoneTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      LAND: "ໂຊນທີ່ດິນ",
      HOUSE: "ໂຊນເຮືອນ",
      COMMERCIAL: "ໂຊນການຄ້າ",
      PUBLIC: "ໂຊນສາທາລະນະ",
    };
    return typeMap[type] || type;
  };

  // Map status to Lao
  const getStatusLabel = (status: string) => {
    return status === "ACTIVE" ? "ເປີດໃຊ້ງານ" : "ປິດໃຊ້ງານ";
  };

  return (
    <div>
      <div className="relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <Loader size="md" content="ກຳລັງໂຫຼດ..." />
          </div>
        )}

        <Table
          autoHeight
          maxHeight={510}
          data={zones}
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

          <Column width={120}>
            <HeaderCell>ຊື່ໂຊນ</HeaderCell>
            <Cell dataKey="zoneName" />
          </Column>

          <Column width={200}>
            <HeaderCell>ໂຄງການ</HeaderCell>
            <Cell>
              {(rowData: Zone) => rowData.project?.projectName || "-"}
            </Cell>
          </Column>

          <Column width={100}>
            <HeaderCell>ປະເພດໂຊນ</HeaderCell>
            <Cell>
              {(rowData: Zone) => getZoneTypeLabel(rowData.zoneType)}
            </Cell>
          </Column>

          <Column width={100} align="right">
            <HeaderCell>ເນື້ອທີ່ (m²)</HeaderCell>
            <Cell>
              {(rowData: Zone) => formatArea(rowData.totalLandArea)}
            </Cell>
          </Column>

          <Column width={100} align="right">
            <HeaderCell>ລາຄາຕໍ່ m²</HeaderCell>
            <Cell>
              {(rowData: Zone) => (
                <span className="font-medium text-blue-600">
                  {formatCurrencyKib(rowData.pricePerSqm)}
                </span>
              )}
            </Cell>
          </Column>

          <Column width={80} align="center">
            <HeaderCell>ເປີເຊັນ</HeaderCell>
            <Cell>
              {(rowData: Zone) => (
                <span className="font-medium">
                  {rowData.persen}%
                </span>
              )}
            </Cell>
          </Column>

          <Column width={150} align="right">
            <HeaderCell>ມູນຄ່າທັງໝົດ</HeaderCell>
            <Cell>
              {(rowData: Zone) => (
                <span className="font-semibold text-green-600">
                  {formatCurrencyKib(rowData.totalLandArea * rowData.pricePerSqm)}
                </span>
              )}
            </Cell>
          </Column>

          <Column width={250}>
            <HeaderCell>ລາຍລະອຽດ</HeaderCell>
            <Cell>
              {(rowData: Zone) => (
                <div
                  className="text-xs overflow-hidden text-ellipsis whitespace-nowrap"
                  title={rowData.description || ""}
                >
                  {rowData.description || "-"}
                </div>
              )}
            </Cell>
          </Column>

          <Column width={110} align="center">
            <HeaderCell>ສະຖານະ</HeaderCell>
            <Cell>
              {(rowData: Zone) => (
                <Tag
                  color={rowData.status === "ACTIVE" ? "green" : "red"}
                  size="sm"
                >
                  {getStatusLabel(rowData.status)}
                </Tag>
              )}
            </Cell>
          </Column>

          <Column width={120}>
            <HeaderCell>ວັນທີ່ສ້າງ</HeaderCell>
            <Cell>
              {(rowData: Zone) =>
                new Date(rowData.createdAt).toLocaleDateString("en-GB")
              }
            </Cell>
          </Column>

          <Column width={100} fixed="right" align="center">
            <HeaderCell>ຈັດການ</HeaderCell>
            <Cell>
              {(rowData: Zone) => (
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
              )}
            </Cell>
          </Column>
        </Table>
      </div>
    </div>
  );
};

export default ZoneTable;
import { Table, IconButton, Loader, Tag } from "rsuite";
import EditIcon from "@rsuite/icons/Edit";
import TrashIcon from "@rsuite/icons/Trash";

import { formatArea,formatCurrencyKib } from "../../../utils/formatters/formatn-number";

import type { Project } from "../../../types/project";

const { Column, HeaderCell, Cell } = Table;

interface ProjectTableProps {
  projects: Project[];
  loading: boolean;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  limit: number;
  page: number;
  onLimitChange: (limit: number) => void;
  searchKeyword: string;
  onSearchChange: (keyword: string) => void;
  sortColumn: string;
  sortType: "ASC" | "DESC";
  onSort: (column: string, type: "ASC" | "DESC") => void;
}

const ProjectTable = ({
  projects,
  loading,
  limit,
  page,
  onEdit,
  onDelete,
  sortColumn,
  sortType,
}: ProjectTableProps) => {
  const getStatusLabel = (status: string) => {
    return status === "ACTIVE" ? "ເປີດໃຊ້ງານ" : "ປິດໃຊ້ງານ";
  };

  return (
    <div>
      <div className="relative overflow-auto">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <Loader size="md" content="ກຳລັງໂຫຼດ..." />
          </div>
        )}

        <Table
          autoHeight
          maxHeight={520}
          data={projects}
          sortColumn={sortColumn}
          sortType={sortType === "ASC" ? "asc" : "desc"}
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

          <Column width={200}>
            <HeaderCell>ຊື່ໂຄງການ</HeaderCell>
            <Cell dataKey="projectName" />
          </Column>

          <Column width={130}>
            <HeaderCell>ບ້ານ</HeaderCell>
            <Cell dataKey="village" />
          </Column>

          <Column width={140}>
            <HeaderCell>ເມືອງ</HeaderCell>
            <Cell>
              {(rowData: Project) => rowData.district?.districtName || "-"}
            </Cell>
          </Column>
          <Column width={140}>
            <HeaderCell>ແຂວງ</HeaderCell>
            <Cell>
              {(rowData: Project) => rowData.district?.province?.provinceName || "-"}
            </Cell>
          </Column>

          <Column width={100} align="right">
            <HeaderCell>ເນື້ອທີ່ (m²)</HeaderCell>
            <Cell>
              {(rowData: Project) => formatArea(rowData.totalLandArea)}
            </Cell>
          </Column>

          <Column width={80} align="center">
            <HeaderCell>ກວ້າງ (m)</HeaderCell>
            <Cell>
              {(rowData: Project) => formatArea(rowData.totalWidth)}
            </Cell>
          </Column>

          <Column width={80} align="center">
            <HeaderCell>ຍາວ (m)</HeaderCell>
            <Cell>
              {(rowData: Project) => formatArea(rowData.totalLength)}
            </Cell>
          </Column>

          <Column width={160} align="right">
            <HeaderCell>ລາຄາ</HeaderCell>
            <Cell>
              {(rowData: Project) => (
                <span className="font-medium text-blue-600">
                  {formatCurrencyKib(rowData.price)}
                </span>
              )}
            </Cell>
          </Column>

          <Column width={140}>
            <HeaderCell>ເຈົ້າຂອງທີ່ດິນ</HeaderCell>
            <Cell>
              {(rowData: Project) => (
                <div className="text-xs">
                  <div className="font-medium">{rowData.landOwnerName}</div>
                </div>
              )}
            </Cell>
          </Column>

          <Column width={140}>
            <HeaderCell>ເບີໂທລະສັບ</HeaderCell>
            <Cell>
              {(rowData: Project) => (
                <div className="text-xs">{rowData.landOwnerPhone}</div>
              )}
            </Cell>
          </Column>

          <Column width={110} align="center">
            <HeaderCell>ສະຖານະ</HeaderCell>
            <Cell>
              {(rowData: Project) => (
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
              {(rowData: Project) =>
                new Date(rowData.createdAt).toLocaleDateString("en-GB")
              }
            </Cell>
          </Column>

          <Column width={100} fixed="right" align="center">
            <HeaderCell>ຈັດການ</HeaderCell>
            <Cell>
              {(rowData: Project) => (
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

export default ProjectTable;
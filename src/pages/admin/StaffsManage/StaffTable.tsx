import { Table, IconButton, Loader, Tag } from "rsuite";
import EditIcon from "@rsuite/icons/Edit";
import TrashIcon from "@rsuite/icons/Trash";

import type { Staff } from "../../../types/staff";

const { Column, HeaderCell, Cell } = Table;

interface StaffTableProps {
  staffs: Staff[];
  loading: boolean;
  onEdit: (staff: Staff) => void;
  onDelete: (staff: Staff) => void;
  limit: number;
  page: number;
  onLimitChange: (limit: number) => void;
  searchKeyword: string;
  onSearchChange: (keyword: string) => void;
  sortColumn: string;
  sortType: "ASC" | "DESC";
  onSort: (column: string, type: "ASC" | "DESC") => void;
}

const StaffTable = ({
  staffs,
  loading,
  limit,
  page,
  onEdit,
  onDelete,
  sortColumn,
  sortType,
  onSort,
}: StaffTableProps) => {
  const handleSortColumn = (column: string, type?: "asc" | "desc") => {
    const sortType = type?.toUpperCase() === "ASC" ? "ASC" : "DESC";
    onSort(column, sortType);
  };

  // Map position to Lao
  const getPositionLabel = (position?: string) => {
    const positionMap: Record<string, string> = {
      MANAGER: "ຜູ້ຈັດການ",
      STAFF: "ພະນັກງານ",
      TECHNICIAN: "ຊ່າງເທັກນິກ",
      ACCOUNTANT: "ບັນຊີ",
      SALES: "ພະນັກງານຂາຍ",
    };
    return position ? positionMap[position] || position : "-";
  };

  // Map status to Lao
  const getStatusLabel = (status?: string) => {
    const statusMap: Record<string, string> = {
      ACTIVE: "ເປີດນຳໃຊ້",
      INACTIVE: "ປິດນຳໃຊ້",
    };
    return status ? statusMap[status] || status : "-";
  };

  // Get status color
  const getStatusColor = (status?: string) => {
    const colorMap: Record<string, "green" | "red" | "orange"> = {
      ACTIVE: "green",
      INACTIVE: "red",
    };
    return status ? colorMap[status] || "blue" : "blue";
  };

  // Format date
  const formatDate = (date?: string | Date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB");
  };

  // Format currency
  const formatCurrency = (amount?: number | string) => {
    if (!amount) return "-";
    return `${Number(amount).toLocaleString()} ກີບ`;
  };

  // Get full address
  const getFullAddress = (staff: Staff) => {
    const parts: string[] = [];
    if (staff.village) parts.push(`ບ້ານ ${staff.village}`);
    if (staff.district?.districtName)
      parts.push(`ເມືອງ ${staff.district.districtName}`);
    if (staff.district?.province?.provinceName)
      parts.push(`ແຂວງ ${staff.district.province.provinceName}`);
    return parts.length > 0 ? parts.join(", ") : "-";
  };

  return (
    <div>
      {/* Table */}
      <div style={{ position: "relative", minHeight: 400 }}>
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
          height={510}
          data={staffs}
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
            <HeaderCell>ລະຫັດພະນັກງານ</HeaderCell>
            <Cell dataKey="staffCode" />
          </Column>

          <Column width={150}>
            <HeaderCell>ຊື່</HeaderCell>
            <Cell dataKey="firstName" />
          </Column>

          <Column width={150}>
            <HeaderCell>ນາມສະກຸນ</HeaderCell>
            <Cell dataKey="lastName" />
          </Column>

          <Column width={140}>
            <HeaderCell>ເບີໂທລະສັບ</HeaderCell>
            <Cell dataKey="phone" />
          </Column>

          <Column width={200}>
            <HeaderCell>ອີເມວ</HeaderCell>
            <Cell>{(rowData: Staff) => rowData.email || "-"}</Cell>
          </Column>

          <Column width={300}>
            <HeaderCell>ທີ່ຢູ່</HeaderCell>
            <Cell>
              {(rowData: Staff) => (
                <div style={{ fontSize: "13px", lineHeight: "1.4" }}>
                  {getFullAddress(rowData)}
                </div>
              )}
            </Cell>
          </Column>

          <Column width={130} align="center">
            <HeaderCell>ຕຳແໜ່ງ</HeaderCell>
            <Cell>
              {(rowData: Staff) => getPositionLabel(rowData.position)}
            </Cell>
          </Column>

          <Column width={120}>
            <HeaderCell>ພະແນກ</HeaderCell>
            <Cell>{(rowData: Staff) => rowData.department || "-"}</Cell>
          </Column>

          <Column width={120}>
            <HeaderCell>ວັນທີ່ເລີ່ມວຽກ</HeaderCell>
            <Cell>{(rowData: Staff) => formatDate(rowData.hireDate)}</Cell>
          </Column>

          <Column width={150} align="right">
            <HeaderCell>ເງິນເດືອນພື້ນຖານ</HeaderCell>
            <Cell>
              {(rowData: Staff) => formatCurrency(rowData.basicSalary)}
            </Cell>
          </Column>

          <Column width={110} align="center">
            <HeaderCell>ສະຖານະ</HeaderCell>
            <Cell>
              {(rowData: Staff) => (
                <Tag color={getStatusColor(rowData.status)} size="sm">
                  {getStatusLabel(rowData.status)}
                </Tag>
              )}
            </Cell>
          </Column>

          <Column width={120}>
            <HeaderCell>ວັນທີ່ສ້າງ</HeaderCell>
            <Cell>{(rowData: Staff) => formatDate(rowData.createdAt)}</Cell>
          </Column>

          <Column width={250}>
            <HeaderCell>ໝາຍເຫດ</HeaderCell>
            <Cell>
              {(rowData: Staff) => (
                <div
                  style={{
                    fontSize: "13px",
                    maxHeight: "40px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={rowData.notes || ""}
                >
                  {rowData.notes || "-"}
                </div>
              )}
            </Cell>
          </Column>

          <Column width={100} fixed="right" align="center">
            <HeaderCell>ຈັດການ</HeaderCell>
            <Cell>
              {(rowData: Staff) => (
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

export default StaffTable;

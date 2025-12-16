import { Table, IconButton, Loader, Tag, Tooltip, Whisper } from "rsuite";
import EditIcon from "@rsuite/icons/Edit";
import TrashIcon from "@rsuite/icons/Trash";
import CheckIcon from "@rsuite/icons/Check";
import CloseIcon from "@rsuite/icons/Close";

import type { User } from "../../../../types/user";

const { Column, HeaderCell, Cell } = Table;

interface UserTableProps {
  users: User[];
  loading: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  page: number;
  limit: number;
  onLimitChange: (limit: number) => void;
  searchKeyword: string;
  onSearchChange: (keyword: string) => void;
  sortColumn: string;
  sortType: "ASC" | "DESC";
  onSort: (col: string, type: "ASC" | "DESC") => void;
  currentUserId?: number;
  isAdmin: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

const UserTable = ({
  users,
  loading,
  limit,
  page,
  onEdit,
  onDelete,
  sortColumn,
  sortType,
}: UserTableProps) => {
  const getStatusLabel = (status: string) => {
    return status === "ACTIVE" ? "ເປີດໃຊ້ງານ" : "ປິດໃຊ້ງານ";
  };

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      ADMIN: "ຜູ້ດູແລລະບົບ",
      MANAGER: "ຜູ້ຈັດການ",
      STAFF: "ພະນັກງານ",
    };
    return roles[role] || role;
  };

  const PermissionIcon = ({ allowed }: { allowed: number }) => {
    return allowed === 1 ? (
      <CheckIcon className="text-green-600" />
    ) : (
      <CloseIcon className="text-red-600" />
    );
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
          data={users}
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

          <Column width={150}>
            <HeaderCell>ຊື່ຜູ້ໃຊ້</HeaderCell>
            <Cell dataKey="username" />
          </Column>

          <Column width={200}>
            <HeaderCell>ອີເມວ</HeaderCell>
            <Cell dataKey="email" />
          </Column>

          <Column width={120} align="center">
            <HeaderCell>ບົດບາດ</HeaderCell>
            <Cell>
              {(rowData: User) => (
                <Tag color="blue" size="sm">
                  {getRoleLabel(rowData.role)}
                </Tag>
              )}
            </Cell>
          </Column>

          <Column width={100} align="center">
            <HeaderCell>ປະເພດ</HeaderCell>
            <Cell>
              {(rowData: User) => (
                <span className="text-sm text-gray-600">
                  {rowData.types || "-"}
                </span>
              )}
            </Cell>
          </Column>

          <Column width={200} align="center">
            <HeaderCell>ສິດການນຳໃຊ້</HeaderCell>
            <Cell>
              {(rowData: User) => (
                <div className="flex gap-3 justify-center items-center">
                  <Whisper
                    placement="top"
                    speaker={<Tooltip>ເພີ່ມຂໍ້ມູນ</Tooltip>}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <PermissionIcon allowed={rowData.inserts} />
                      <span className="text-xs text-gray-500">ເພີ່ມ</span>
                    </div>
                  </Whisper>

                  <Whisper
                    placement="top"
                    speaker={<Tooltip>ແກ້ໄຂຂໍ້ມູນ</Tooltip>}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <PermissionIcon allowed={rowData.updates} />
                      <span className="text-xs text-gray-500">ແກ້ໄຂ</span>
                    </div>
                  </Whisper>

                  <Whisper
                    placement="top"
                    speaker={<Tooltip>ລົບຂໍ້ມູນ</Tooltip>}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <PermissionIcon allowed={rowData.deletes} />
                      <span className="text-xs text-gray-500">ລົບ</span>
                    </div>
                  </Whisper>

                  <Whisper placement="top" speaker={<Tooltip>ຍົກເລີກ</Tooltip>}>
                    <div className="flex flex-col items-center gap-1">
                      <PermissionIcon allowed={rowData.cancels} />
                      <span className="text-xs text-gray-500">ຍົກເລີກ</span>
                    </div>
                  </Whisper>
                </div>
              )}
            </Cell>
          </Column>

          <Column width={110} align="center">
            <HeaderCell>ສະຖານະ</HeaderCell>
            <Cell>
              {(rowData: User) => (
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
              {(rowData: User) =>
                new Date(rowData.createdAt).toLocaleDateString("en-GB")
              }
            </Cell>
          </Column>

          <Column width={100} fixed="right" align="center">
            <HeaderCell>ຈັດການ</HeaderCell>
            <Cell>
              {(rowData: User) => (
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

export default UserTable;
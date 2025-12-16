import { useEffect, useState } from "react";
import { Button, Message, toaster, Panel } from "rsuite";
import PlusIcon from "@rsuite/icons/Plus";

import { useUserStore } from "../../../../store/userStore";
import { useAuthStore } from "../../../../store/authStore";
import UserForm from "./UserForm.tsx";
import UserTable from "./UserTable.tsx";
import DeleteConfirmModal from "../../../../components/DeleteConFirmModal";
import Pagination from "../../../../components/Pagination";
import Limit from "../../../../components/Limit";
import SearchFilter from "../../../../components/SearchFilter";
import Search from "../../../../components/Search";
import type { User } from "../../../../types/user";

const STATUSES = [
  { value: "ACTIVE", label: "ເປີດນຳໃຊ້" },
  { value: "INACTIVE", label: "ປິດນຳໃຊ້" },
];

const ROLES = [
  { value: "ADMIN", label: "ຜູ້ດູແລລະບົບ" },
  { value: "MANAGER", label: "ຜູ້ຈັດການ" },
  { value: "STAFF", label: "ພະນັກງານ" },
];

const UserPage = () => {
  const {
    users,
    isLoading,
    error,
    fetchUsers,
    clearError,
    selectedUser,
    setSelectedUser,
    deleteUser,
  } = useUserStore();

  const { currentUser, checkRole, checkPermission } = useAuthStore();

  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [clientSearch, setClientSearch] = useState("");

  // Applied filters (sent to API)
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    orderBy: "createdAt",
    order: "DESC" as "ASC" | "DESC",
    role: "",
    status: "",
  });

  // Pending filters (user selections, not applied yet)
  const [pendingFilters, setPendingFilters] = useState({
    role: "",
    status: "",
  });

  // Pagination state (for client-side)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
  });

  // Permission checks
  const canCreateUser = checkPermission("inserts");
  const canUpdateUser = checkPermission("updates");
  const canDeleteUser = checkRole("ADMIN"); // Only admins can delete
  const isAdmin = checkRole("ADMIN");

  useEffect(() => {
    const { role, status, ...baseParams } = filters;
    const params: any = { ...baseParams };

    if (role) params.role = role;
    if (status) params.status = status;

    fetchUsers(params);
  }, [filters]);

  useEffect(() => {
    if (error) {
      toaster.push(
        <Message showIcon type="error" closable>
          {error}
        </Message>,
        { placement: "topEnd" }
      );
      clearError();
    }
  }, [error]);

  const handleFilterSelect = (title: string, value: string) => {
    const key = title === "ບົດບາດ" ? "role" : "status";

    setPendingFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSearchClick = () => {
    setFilters((prev) => ({ ...prev, ...pendingFilters, page: 1 }));
  };

  const handleClearFilters = () => {
    const empty = {
      role: "",
      status: "",
    };
    setPendingFilters(empty);
    setFilters((prev) => ({ ...prev, ...empty, page: 1 }));
  };

  const handleEdit = (user: User) => {
    // Check if user can edit this user
    if (!canUpdateUser) {
      toaster.push(
        <Message showIcon type="warning">
          ທ່ານບໍ່ມີສິດແກ້ໄຂຜູ້ໃຊ້
        </Message>,
        { placement: "topEnd" }
      );
      return;
    }

    // Non-admins can only edit themselves
    if (!isAdmin && user.id !== currentUser?.id) {
      toaster.push(
        <Message showIcon type="warning">
          ທ່ານສາມາດແກ້ໄຂໄດ້ແຕ່ຂໍ້ມູນຂອງທ່ານເທົ່ານັ້ນ
        </Message>,
        { placement: "topEnd" }
      );
      return;
    }

    setSelectedUser(user);
    setShowForm(true);
  };

  const handleDeleteClick = (user: User) => {
    // Check permissions
    if (!canDeleteUser) {
      toaster.push(
        <Message showIcon type="warning">
          ທ່ານບໍ່ມີສິດລົບຜູ້ໃຊ້ (ມີແຕ່ Admin ເທົ່ານັ້ນ)
        </Message>,
        { placement: "topEnd" }
      );
      return;
    }

    // Prevent deleting self
    if (user.id === currentUser?.id) {
      toaster.push(
        <Message showIcon type="warning">
          ທ່ານບໍ່ສາມາດລົບບັນຊີຂອງທ່ານເອງໄດ້
        </Message>,
        { placement: "topEnd" }
      );
      return;
    }

    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete.id);
      toaster.push(
        <Message showIcon type="success">
          ລົບຜູ້ໃຊ້ສຳເລັດ
        </Message>,
        { placement: "topEnd" }
      );
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch {
      toaster.push(
        <Message showIcon type="error">
          ລົບຜູ້ໃຊ້ບໍ່ສຳເລັດ
        </Message>,
        { placement: "topEnd" }
      );
    }
  };

  const filterOpts = [
    {
      title: "ບົດບາດ",
      items: ROLES.map((r) => r.value),
      labels: Object.fromEntries(ROLES.map((r) => [r.value, r.label])),
      type: "select" as const,
    },
    {
      title: "ສະຖານະ",
      items: STATUSES.map((s) => s.value),
      labels: Object.fromEntries(STATUSES.map((s) => [s.value, s.label])),
      type: "input" as const,
    },
  ];

  const filteredUsers = clientSearch
    ? users.filter((u) =>
        [u.username, u.email, u.role].some((f) =>
          f?.toLowerCase().includes(clientSearch.toLowerCase())
        )
      )
    : users;

  // Update pagination when filtered users change
  useEffect(() => {
    setPagination({
      total: filteredUsers.length,
      page: filters.page,
      limit: filters.limit,
    });
  }, [filteredUsers, filters.page, filters.limit]);

  return (
    <div>
      <Panel
        header={
          <div className="flex justify-between items-center">
            <h4 className="text-xl font-semibold">ຈັດການຜູ້ໃຊ້</h4>
            {canCreateUser && (
              <Button
                appearance="primary"
                startIcon={<PlusIcon />}
                onClick={() => {
                  setSelectedUser(null);
                  setShowForm(true);
                }}
              >
                ສ້າງຜູ້ໃຊ້ໃໝ່
              </Button>
            )}
          </div>
        }
      >
        <SearchFilter
          onSearchClick={handleSearchClick}
          filters={filterOpts}
          onFilterSelect={handleFilterSelect}
          onClearFilters={handleClearFilters}
          activeFilters={{
            ບົດບາດ: pendingFilters.role,
            ສະຖານະ: pendingFilters.status,
          }}
          colProps={{
            ບົດບາດ: { xs: 12, sm: 6, md: 6, lg: 4 },
            ສະຖານະ: { xs: 12, sm: 6, md: 6, lg: 4 },
          }}
        />

        <div className="flex justify-between items-center pb-2">
          <Limit
            limit={filters.limit}
            total={pagination.total}
            onLimitChange={(limit) =>
              setFilters((prev) => ({ ...prev, limit, page: 1 }))
            }
            baseOptions={[10, 25, 50, 100]}
          />
          <Search onSearch={setClientSearch} />
        </div>

        <UserTable
          users={filteredUsers}
          loading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          page={filters.page}
          limit={filters.limit}
          onLimitChange={(limit) =>
            setFilters((prev) => ({ ...prev, limit, page: 1 }))
          }
          searchKeyword=""
          onSearchChange={setClientSearch}
          sortColumn={filters.orderBy}
          sortType={filters.order}
          onSort={(col, type) =>
            setFilters((prev) => ({ ...prev, orderBy: col, order: type }))
          }
          currentUserId={currentUser?.id}
          isAdmin={isAdmin}
          canEdit={canUpdateUser}
          canDelete={canDeleteUser}
        />

        {pagination.total > 0 && (
          <Pagination
            total={pagination.total}
            limit={pagination.limit}
            page={pagination.page}
            onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
          />
        )}
      </Panel>

      <UserForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />

      <DeleteConfirmModal
        open={showDeleteModal}
        itemName={userToDelete?.username || ""}
        onClose={() => {
          setShowDeleteModal(false);
          setUserToDelete(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default UserPage;

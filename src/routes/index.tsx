import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Loader } from "rsuite";

import ProtectedRoute from "../components/ProtectedRoute";
import AdminLayout from "../layouts/AdminLayout";
import UserLayout from "../layouts/UserLayout";
import Login from "../pages/Login";
import AdminDashboard from "../pages/admin/AdminPage";
import UserHome from "../pages/user/UserPage";

// Lazy-loaded pages
const ProjectManagement = lazy(
  () => import("../pages/admin/ProjectsManage/ProjectPage")
);
const ZonePage = lazy(
  () => import("../pages/admin/ZoneManage/ZonePage")
);
const SalePage = lazy(
  () => import("../pages/admin/Sale/SalePage")
);
const ExpensePage = lazy(
  () => import("../pages/admin/ExpenseManage/ExpensePage")
);
const ProvincePage = lazy(
  () => import("../pages/admin/SettingsManage/ProvincePage")
);
const DistrictPage = lazy(
  () => import("../pages/admin/SettingsManage/DistrictPage")
);
const CurrencyPage = lazy(
  () => import("../pages/admin/SettingsManage/CurrencyPage")
);
const CustomerPage = lazy(
  () => import("../pages/admin/CustomersManage/CustomerPage")
);
const LandPlotPage = lazy(
  () => import("../pages/admin/LandManage/LandPage")
);
const HousePage = lazy(
  () => import("../pages/admin/HouseManage/HousePage")
);
const StaffManagement = lazy(
  () => import("../pages/admin/StaffsManage/StaffPage")
);
const UserManagement = lazy(
  () => import("../pages/admin/SettingsManage/UserManage/UserPage")
);

// Loader component for Suspense
const LoadingScreen = () => (
  <div className="flex justify-center items-center min-h-screen">
    <Loader size="lg" content="ກຳລັງໂຫຼດ..." />
  </div>
);

// Optional 404 Page
const NotFoundPage = () => (
  <div className="flex justify-center items-center min-h-screen text-2xl font-bold">
    404 | ໜ້ານີ້ບໍ່ພົບ
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />

      {/* Admin Routes - Only for ADMIN role */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />

        <Route
          path="projects"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <ProjectManagement />
            </Suspense>
          }
        />

        <Route
          path="zones"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <ZonePage />
            </Suspense>
          }
        />

        {/*  Updated Sales Routes with Dynamic Routing */}
        <Route
          path="sales"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <SalePage />
            </Suspense>
          }
        />
        <Route
          path="sales/:projectId"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <SalePage />
            </Suspense>
          }
        />
        <Route
          path="sales/:projectId/:zoneId"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <SalePage />
            </Suspense>
          }
        />

        <Route
          path="expense"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <ExpensePage />
            </Suspense>
          }
        />

        {/* Settings Routes */}
        <Route path="settings">
          <Route
            path="province"
            element={
              <Suspense fallback={<LoadingScreen />}>
                <ProvincePage />
              </Suspense>
            }
          />
          <Route
            path="district"
            element={
              <Suspense fallback={<LoadingScreen />}>
                <DistrictPage />
              </Suspense>
            }
          />
          <Route
            path="currency"
            element={
              <Suspense fallback={<LoadingScreen />}>
                <CurrencyPage />
              </Suspense>
            }
          />
          <Route
            path="users-management"
            element={
              <Suspense fallback={<LoadingScreen />}>
                <UserManagement />
              </Suspense>
            }
          />
          <Route
            path="customer"
            element={
              <Suspense fallback={<LoadingScreen />}>
                <CustomerPage />
              </Suspense>
            }
          />
        </Route>

        <Route
          path="lands"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <LandPlotPage />
            </Suspense>
          }
        />

        <Route
          path="houses"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <HousePage />
            </Suspense>
          }
        />

        <Route
          path="staffs"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <StaffManagement />
            </Suspense>
          }
        />

        {/* Admin 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* User Routes - For USER role (or allow multiple roles) */}
      <Route
        path="/user"
        element={
          <ProtectedRoute role={["user", "staff"]}>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<UserHome />} />
        <Route path="home" element={<UserHome />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Manager Routes - Example of role-specific routing */}
      <Route
        path="/manager"
        element={
          <ProtectedRoute role={["manager", "admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        {/* Add manager-specific routes */}
      </Route>

      {/* Catch-all 404 - Redirect to login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
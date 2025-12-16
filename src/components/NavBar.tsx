import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import ProjectIcon from "@rsuite/icons/Project";
import PeoplesIcon from "@rsuite/icons/Peoples";
import BarChartIcon from "@rsuite/icons/BarChart";

import GearIcon from "@rsuite/icons/Gear";

import GlobalIcon from "@rsuite/icons/Global";
import CreditCardPlusIcon from "@rsuite/icons/CreditCardPlus";
import AdminIcon from "@rsuite/icons/Admin";
import UserInfoIcon from "@rsuite/icons/UserInfo";
import ArrowDownLineIcon from "@rsuite/icons/ArrowDownLine";
import ArrowRightLineIcon from "@rsuite/icons/ArrowRightLine";

import {
  CreditCard,
  Folder,
  Home,
  LandPlot,
  Map,
  MapPin,
  ShoppingCart,
  Warehouse,
} from "lucide-react";

interface MenuItem {
  title: string;
  path?: string;
  icon?: React.ReactNode;
  children?: { title: string; path: string; icon?: React.ReactNode }[];
}

const AdminMenu: MenuItem[] = [
  {
    title: "ໜ້າຫຼັກ",
    path: "/admin/dashboard",
    icon: <Home size={16} />,
  },
  {
    title: "ຂາຍດິນ",
    path: "/admin/sales",
    icon: <ShoppingCart size={16} />,
  },
  {
    title: "ຈັດການໂຄງການ",
    icon: <ProjectIcon />,
    children: [
      { title: "ໂຄງການ", path: "/admin/projects", icon: <Folder size={16} /> },
      { title: "ໂຊນ", path: "/admin/zones", icon: <Map size={16} /> },
      { title: "ທີ່ດິນ", path: "/admin/lands", icon: <LandPlot size={16} /> },
      { title: "ເຮືອນ", path: "/admin/houses", icon: <Warehouse size={16} /> },
    ],
  },
  {
    title: "ຈັດການການຂາຍ",
    path: "/admin/sale/management",
    icon: <CreditCard size={16} />,
  },
  {
    title: "ຂໍ້ມູນພະນັກງານ-ລູກຄ້າ",
    icon: <PeoplesIcon />,
    children: [
      { title: "ພະນັກງານຂາຍ", path: "/admin/staffs", icon: <AdminIcon /> },
      {
        title: "ລູກຄ້າ",
        path: "/admin/settings/customer",
        icon: <UserInfoIcon />,
      },
    ],
  },
  {
    title: "ລາຍງານ",
    path: "/admin/reports",
    icon: <BarChartIcon />,
  },
  {
    title: "ລາຍຈ່າຍ",
    path: "/admin/expense",
    icon: <CreditCardPlusIcon />,
  },
  {
    title: "ຕັ້ງຄ່າ",
    icon: <GearIcon />,
    children: [
      {
        title: "ແຂວງ",
        path: "/admin/settings/province",
        icon: <MapPin size={16} />,
      },
      {
        title: "ເມືອງ",
        path: "/admin/settings/district",
        icon: <MapPin size={16} />,
      },
      {
        title: "ອັດຕາແລກປ່ຽນ",
        path: "/admin/settings/currency",
        icon: <GlobalIcon />,
      },
      {
        title: "ຜູ້ໃຊ້",
        path: "/admin/settings/users-management",
        icon: <UserInfoIcon />,
      },
    ],
  },
];

const NavBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    const activeMenu = AdminMenu.find((menu) =>
      menu.children?.some((c) => c.path === location.pathname)
    );
    setOpenMenu(activeMenu?.title ?? null);
  }, [location.pathname]);

  const toggleMenu = (menu: MenuItem) => {
    if (menu.children) {
      setOpenMenu(openMenu === menu.title ? null : menu.title);
    } else if (menu.path) {
      navigate(menu.path);
    }
  };

  const renderChild = (child: {
    title: string;
    path: string;
    icon?: React.ReactNode;
  }) => {
    const isActive = location.pathname === child.path;

    return (
      <Link
        key={child.path}
        to={child.path}
        className={`group flex items-center gap-2 px-3 py-2 rounded transition-all duration-200
        ${
          isActive
            ? "bg-red-600 text-white font-semibold"
            : "bg-red-800 text-gray-300 hover:bg-red-500 hover:text-white hover:translate-x-1"
        }`}
      >
        {child.icon && (
          <span
            className={`transition-colors ${
              isActive ? "text-white" : "text-gray-300 group-hover:text-white"
            }`}
          >
            {child.icon}
          </span>
        )}

        <span
          className={`transition-colors ${
            isActive ? "text-white" : "text-gray-300 group-hover:text-white"
          }`}
        >
          {child.title}
        </span>
      </Link>
    );
  };

  return (
    <nav className="bg-gray-800 h-full w-64 p-4 text-white overflow-auto">
      <div className="flex items-center gap-2 mb-6">
        <AdminIcon style={{ fontSize: "1.5rem" }} />
        <p className="font-bold text-xl">Admin Panel</p>
      </div>

      <ul className="flex flex-col gap-1">
        {AdminMenu.map((menu) => {
          const isActive =
            menu.path === location.pathname ||
            menu.children?.some((c) => c.path === location.pathname);

          return (
            <li key={menu.title}>
              <button
                onClick={() => toggleMenu(menu)}
                className={`flex justify-between items-center w-full px-3 py-2 rounded transition-colors ${
                  isActive ? "bg-gray-700 font-semibold" : "hover:bg-gray-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  {menu.icon && (
                    <span className="text-gray-400">{menu.icon}</span>
                  )}
                  <span>{menu.title}</span>
                </div>
                {menu.children &&
                  (openMenu === menu.title ? (
                    <ArrowDownLineIcon />
                  ) : (
                    <ArrowRightLineIcon />
                  ))}
              </button>

              {menu.children && openMenu === menu.title && (
                <div className="ml-6 mt-1 flex flex-col gap-1">
                  {menu.children.map(renderChild)}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default NavBar;
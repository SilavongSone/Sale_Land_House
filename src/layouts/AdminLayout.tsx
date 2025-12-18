import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "../components/Header";
import NavBar from "../components/NavBar";

const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isSidebarOpen && window.innerWidth < 768) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  return (
    <div className="h-screen flex flex-col">
      <Header open={isSidebarOpen} setOpen={setSidebarOpen} />

      <div className="flex flex-1 overflow-hidden pt-16  " >
        {/* Sidebar */}
        <aside
          className={`
            fixed md:fixed top-16 md:top-16 left-0 h-[calc(100vh-64px)]
            w-64 bg-gray-800 text-white z-40 overflow-y-auto
            transform transition-transform duration-300
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <NavBar />
        </aside>

        {/* Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0  bg-opacity-50 md:hidden z-30 top-16"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Content */}
        <main
          className={`
            flex-1 overflow-auto bg-gray-100 
            transition-all duration-300
            ${isSidebarOpen ? "md:ml-64" : "md:ml-0"}
          `}
        >
          <div>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

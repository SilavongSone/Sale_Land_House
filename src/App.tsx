import { useEffect } from 'react';
import { BrowserRouter } from "react-router-dom";
import { useAuthStore } from './store/authStore';
import { Loader } from "rsuite";
import AppRoutes from "./routes";
import "./index.css";

function App() {
  const { initAuth, isLoading } = useAuthStore();

  useEffect(() => {
    // Initialize auth on app mount
    initAuth();
  }, [initAuth]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader size="lg" content="ກຳລັງກວດສອບ..." />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
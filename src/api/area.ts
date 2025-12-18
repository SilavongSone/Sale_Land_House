import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

// 🔐 helper ดึง token
const getToken = () => localStorage.getItem("token");

export const areaAPI = {

  // ===== ZONE LEVEL =====
  // GET /api/zones/:id/area
  getZoneArea: async (zoneId: string) => {
    const res = await axios.get(
      `${BASE_URL}/zones/${zoneId}/area`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );
    return res.data;
  },

  // ===== PROJECT LEVEL =====
  // GET /api/projects/:id/area
  getProjectArea: async (projectId: string) => {
    const res = await axios.get(
      `${BASE_URL}/projects/${projectId}/area`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );
    return res.data;
  },

  // GET /api/projects/:id/zones
  getProjectWithZones: async (projectId: string) => {
    const res = await axios.get(
      `${BASE_URL}/projects/${projectId}/zones`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );
    return res.data;
  },

  // GET /api/projects/:id/summary
  getProjectSummary: async (projectId: string) => {
    const res = await axios.get(
      `${BASE_URL}/projects/${projectId}/summary`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );
    return res.data;
  },
};

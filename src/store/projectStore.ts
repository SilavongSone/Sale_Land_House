import { create } from "zustand";
import { projectAPI } from "../api/project";
import type { ProjectStore, Project, FetchProjectsParams, ProjectsResponse } from "../types/project";
import { Pagination } from "../utils/pagination";

const handleError = (e: any, msg: string) =>
  e?.response?.data?.message || msg;

export const useProjectStore = create<ProjectStore>((set, get) => ({
  // State
  projects: [],
  projectOptions: [],
  selectedProject: null,
  pagination: null,
  isLoading: false,
  error: null,

  // Fetch all projects
  fetchProjects: async (params?: FetchProjectsParams) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = Pagination(params || {});
      const res: ProjectsResponse = await projectAPI.getAll(queryParams);
      set({ projects: res.data, pagination: res.pagination, isLoading: false });
      console.log(' Store: Fetched projects:', res.data);
    } catch (e: any) {
      set({
        projects: [],
        pagination: null,
        error: handleError(e, "Failed to load projects"),
        isLoading: false
      });
    }
  },

  // Fetch options
  fetchProjectOptions: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await projectAPI.getOption();
      set({ projectOptions: res.data, isLoading: false });
    } catch (e: any) {
      set({ error: handleError(e, "Failed to load options"), isLoading: false });
    }
  },

  // Fetch by ID
  fetchProjectById: async (id: number | string) => {
    set({ isLoading: true, error: null });
    try {
      const res: Project = await projectAPI.getById(id);
      set({ selectedProject: res, isLoading: false });
    } catch (e: any) {
      set({ error: handleError(e, "Failed to load project"), isLoading: false });
    }
  },

  // Create with re-fetch
  createProject: async (data: Partial<Project>) => {
    set({ isLoading: true, error: null });
    try {
      const payload = {
        projectName: data.projectName,
        totalLandArea: Number(data.totalLandArea),
        totalWidth: Number(data.totalWidth),
        totalLength: Number(data.totalLength),
        village: data.village,
        districtId: Number(data.districtId),
        landOwnerName: data.landOwnerName,
        landOwnerPhone: data.landOwnerPhone,
        price: Number(data.price),
        description: data.description,
        status: data.status,
      };

      await projectAPI.create(payload);

      // Re-fetch to get complete data with province/district
      await get().fetchProjects();

      set({ isLoading: false });
    } catch (e: any) {
      set({ error: handleError(e, "Failed to create project"), isLoading: false });
      throw e;
    }
  },

  // Update with re-fetch
  updateProject: async (id: number | string, data: Partial<Project>) => {
    set({ isLoading: true, error: null });
    try {
      await projectAPI.update(id, data);

      // Re-fetch to get complete data with province/district
      await get().fetchProjects();

      set({ isLoading: false });
    } catch (e: any) {
      set({ error: handleError(e, "Failed to update project"), isLoading: false });
      throw e;
    }
  },

  // Delete with optimistic update
  deleteProject: async (id: number | string) => {
    set({ isLoading: true, error: null });
    try {
      await projectAPI.delete(id);
      set((s) => ({
        projects: s.projects.filter((p) => p.projectId !== Number(id)),
        selectedProject: s.selectedProject?.projectId === Number(id) ? null : s.selectedProject,
        isLoading: false,
      }));
    } catch (e: any) {
      set({ error: handleError(e, "Failed to delete project"), isLoading: false });
      throw e;
    }
  },

  setSelectedProject: (project: Project | null) => set({ selectedProject: project }),
  clearError: () => set({ error: null }),
  reset: () => set({
    projects: [],
    projectOptions: [],
    selectedProject: null,
    pagination: null,
    isLoading: false,
    error: null
  }),
}));
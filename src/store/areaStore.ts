import { create } from "zustand";
import { areaAPI } from "../api/area";
import type {  AreaStoreState } from "../types/area";



export const useAreaStore = create<AreaStoreState>((set) => ({
  zoneArea: undefined,
  projectArea: undefined,
  projectWithZones: undefined,
  projectSummary: undefined,
  loading: false,
  error: undefined,

  fetchZoneArea: async (zoneId) => {
    set({ loading: true, error: undefined });
    try {
      const res = await areaAPI.getZoneArea(zoneId);
      set({ zoneArea: res.data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchProjectArea: async (projectId) => {
    set({ loading: true, error: undefined });
    try {
      const res = await areaAPI.getProjectArea(projectId);
      set({ projectArea: res.data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchProjectWithZones: async (projectId) => {
    set({ loading: true, error: undefined });
    try {
      const res = await areaAPI.getProjectWithZones(projectId);
      set({ projectWithZones: res.data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchProjectSummary: async (projectId) => {
    set({ loading: true, error: undefined });
    try {
      const res = await areaAPI.getProjectSummary(projectId);
      set({ projectSummary: res.data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  clear: () => set({
    zoneArea: undefined,
    projectArea: undefined,
    projectWithZones: undefined,
    projectSummary: undefined,
    error: undefined
  })
}));

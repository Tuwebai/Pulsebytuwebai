import type { AppContextType } from '@/contexts/appContext.types';

export const defaultAppContext: AppContextType = {
  user: null,
  projects: [],
  isAuthenticated: false,
  authReady: false,
  logs: [],
  loading: true,
  error: 'Contexto no disponible',
  login: async () => false,
  register: async () => false,
  loginWithGoogle: async () => false,
  loginWithGithub: async () => false,
  logout: async () => {},
  createProject: async () => {},
  updateProject: async () => {},
  deleteProject: async () => {},
  addFunctionalities: async () => {},
  addCommentToPhase: async () => {},
  addLog: async () => {},
  getProjectLogs: () => [],
  refreshData: async () => {},
  clearError: () => {},
  updateUserSettings: async () => false,
  getUserProjects: () => []
};

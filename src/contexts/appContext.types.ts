export interface Project {
  id: string;
  name: string;
  description?: string;
  technologies: string[];
  environment_variables?: Record<string, unknown>;
  status: 'development' | 'production' | 'paused' | 'maintenance';
  github_repository_url?: string;
  customicon?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  is_active: boolean;
  domain?: string | null;
  ga4_property_id?: string | null;
  progress?: number | null;
  completion_percentage?: number | null;
  tareas?: Array<Record<string, unknown>>;
  type?: 'Web' | 'App' | 'Landing' | 'Ecommerce' | string;
  funcionalidades?: string[];
  fases?: Array<{
    key: string;
    estado: 'Pendiente' | 'En Progreso' | 'Terminado';
    descripcion?: string;
    fechaEntrega?: string;
    archivos?: Array<{ url: string; name: string }>;
    comentarios?: Array<{
      id: string;
      texto: string;
      autor: string;
      fecha: string;
      tipo: 'admin' | 'cliente';
    }>;
  }>;
  progressHistory?: Array<{ date: string; progress: number }>;
}

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
  avatar?: string;
  avatar_url?: string;
  onboarding_completed?: boolean;
  onboarding_completed_at?: string | null;
  pulse_access_status?: 'pending' | 'invited' | 'active' | 'disabled';
  pulse_access_granted_at?: string | null;
  pulse_access_granted_by?: string | null;
  pulse_access_disabled_at?: string | null;
  business_name?: string | null;
  business_industry?: string | null;
  profile_completed?: boolean;
  notif_new_consultation?: boolean;
  notif_monthly_summary?: boolean;
  notif_project_update?: boolean;
  phone?: string;
  company?: string;
  position?: string;
  bio?: string;
  location?: string;
  website?: string;
  two_factor_auth?: boolean;
  push_notifications?: boolean;
  email_notifications?: boolean;
  sms_notifications?: boolean;
  sound_enabled?: boolean;
  vibration_enabled?: boolean;
  quiet_hours?: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  project_updates?: boolean;
  payment_reminders?: boolean;
  support_updates?: boolean;
  marketing_emails?: boolean;
  auto_save?: boolean;
  animations_enabled?: boolean;
  low_bandwidth_mode?: boolean;
  session_timeout?: number;
  login_notifications?: boolean;
  device_management?: boolean;
  last_login?: string;
}

export interface ProjectLog {
  id: string;
  projectId: string;
  action: string;
  user: string;
  timestamp: string;
}

export interface AppContextType {
  user: User | null;
  projects: Project[];
  projectsReady: boolean;
  isAuthenticated: boolean;
  authReady: boolean;
  logs: ProjectLog[];
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  loginWithGithub: () => Promise<boolean>;
  logout: () => Promise<void>;
  createProject: (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'ownerEmail'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addFunctionalities: (projectId: string, functionalities: string[]) => Promise<void>;
  addCommentToPhase: (
    projectId: string,
    faseKey: string,
    comment: {
      texto: string;
      autor: string;
      tipo: 'admin' | 'cliente';
    }
  ) => Promise<void>;
  addLog: (log: Omit<ProjectLog, 'id' | 'timestamp'>) => Promise<void>;
  getProjectLogs: (projectId: string) => ProjectLog[];
  refreshData: () => Promise<void>;
  clearError: () => void;
  updateUserSettings: (updates: Partial<User>) => Promise<boolean>;
  getUserProjects: () => Project[];
}

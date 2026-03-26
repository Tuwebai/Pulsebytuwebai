// Tipos de usuario para el Pulse By TuWebAI

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;

  // Avatar del usuario
  avatar_url?: string;

  // Perfil extendido
  phone?: string;
  company?: string;
  position?: string;
  bio?: string;
  location?: string;
  website?: string;
  website_status?: 'missing' | 'pending_review' | 'approved' | 'rejected';
  website_submitted_at?: string | null;
  website_reviewed_at?: string | null;
  website_reviewed_by?: string | null;
  website_review_notes?: string | null;

  // Seguridad y experiencia del cliente
  twoFactorAuth?: boolean;
  pushNotifications?: boolean;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
  quietHours?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  projectUpdates?: boolean;
  paymentReminders?: boolean;
  supportUpdates?: boolean;
  marketingEmails?: boolean;
  animationsEnabled?: boolean;
  lowBandwidthMode?: boolean;
  sessionTimeout?: number;
  loginNotifications?: boolean;
  deviceManagement?: boolean;

  // Timestamps
  lastLogin?: string;
  last_login?: string;
}

export interface CreateUserData {
  email: string;
  full_name?: string;
  role?: 'admin' | 'user';
  phone?: string;
  company?: string;
  position?: string;
  bio?: string;
  location?: string;
  website?: string;
  website_status?: 'missing' | 'pending_review' | 'approved' | 'rejected';
  website_review_notes?: string | null;
}

export interface UpdateUserData {
  full_name?: string;
  role?: 'admin' | 'user';
  phone?: string;
  company?: string;
  position?: string;
  bio?: string;
  location?: string;
  website?: string;
  website_status?: 'missing' | 'pending_review' | 'approved' | 'rejected';
  website_submitted_at?: string | null;
  website_reviewed_at?: string | null;
  website_reviewed_by?: string | null;
  website_review_notes?: string | null;
  avatar_url?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
    picture?: string;
    photoURL?: string;
    image?: string;
  };
}

export interface UserRole {
  id: string;
  name: string;
  permissions: string[];
  description?: string;
}

export interface UserPermission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

export interface UserSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  deviceInfo?: {
    userAgent: string;
    ip: string;
    location?: string;
  };
  isActive: boolean;
}

export interface UserAuditLog {
  id: string;
  userId: string;
  action: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export default User;

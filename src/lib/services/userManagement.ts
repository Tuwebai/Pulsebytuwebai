
import { supabase } from '../supabase';
import { handleSupabaseError } from './errorHandler';
import { toast } from '@/hooks/use-toast';

// Tipos de usuario basados en la estructura real de la base de datos
export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
  avatar_url: string | null;
  avatar?: string | null;
  uid?: string;
}

export interface UserRole {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  permissions: string[];
  is_system: boolean;
  can_delete: boolean;
  can_edit: boolean;
  created_at: string;
  updated_at: string;
  isDefault?: boolean;
}

export interface UserInvitation {
  id: string;
  email: string;
  role_id: string | null;
  invited_by: string | null;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled' | 'declined';
  token: string;
  expires_at: string;
  message: string | null;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
  role?: string | null;
  invitedBy?: string | null;
  expiresAt?: string;
}

export interface UserProfile extends User {
  // Campos adicionales que podrÃ­an existir
  display_name?: string | null;
  displayName?: string | null;
  phone?: string;
  department?: string;
  position?: string;
  bio?: string;
  skills?: string[];
  status?: 'active' | 'inactive' | 'suspended';
  last_login?: string;
  login_count?: number;
  preferences?: {
    language: string;
    timezone: string;
    theme: 'light' | 'dark' | 'auto';
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
  metadata?: {
    lastLogin: string | null;
    loginCount: number;
    createdAt: string;
  };
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  details: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  userId?: string;
  resource?: string;
  timestamp?: string;
}

export type Invitation = UserInvitation;
export type UserAuditLog = AuditLog;

interface UserFilters {
  role?: string;
  search?: string;
}

interface UserSort {
  field?: keyof User;
  direction?: 'asc' | 'desc';
}

interface AcceptInvitationData {
  displayName: string;
  phone?: string;
  department?: string;
  position?: string;
  bio?: string;
}

export interface UserPermission {
  id: string;
  name: string;
  display_name: string;
  description: string;
  category: string;
  action: string;
}

// Permisos del sistema
const SYSTEM_PERMISSIONS: UserPermission[] = [
  { id: 'users.view', name: 'users.view', display_name: 'Ver Usuarios', description: 'Puede ver la lista de usuarios', category: 'users', action: 'view' },
  { id: 'users.create', name: 'users.create', display_name: 'Crear Usuarios', description: 'Puede crear nuevos usuarios', category: 'users', action: 'create' },
  { id: 'users.edit', name: 'users.edit', display_name: 'Editar Usuarios', description: 'Puede editar usuarios existentes', category: 'users', action: 'edit' },
  { id: 'users.delete', name: 'users.delete', display_name: 'Eliminar Usuarios', description: 'Puede eliminar usuarios', category: 'users', action: 'delete' },
  { id: 'roles.view', name: 'roles.view', display_name: 'Ver Roles', description: 'Puede ver roles del sistema', category: 'roles', action: 'view' },
  { id: 'roles.create', name: 'roles.create', display_name: 'Crear Roles', description: 'Puede crear nuevos roles', category: 'roles', action: 'create' },
  { id: 'roles.edit', name: 'roles.edit', display_name: 'Editar Roles', description: 'Puede editar roles existentes', category: 'roles', action: 'edit' },
  { id: 'roles.delete', name: 'roles.delete', display_name: 'Eliminar Roles', description: 'Puede eliminar roles', category: 'roles', action: 'delete' },
  { id: 'projects.view', name: 'projects.view', display_name: 'Ver Proyectos', description: 'Puede ver todos los proyectos', category: 'projects', action: 'view' },
  { id: 'projects.manage', name: 'projects.manage', display_name: 'Gestionar Proyectos', description: 'Puede gestionar proyectos', category: 'projects', action: 'manage' },
  { id: 'tickets.view', name: 'tickets.view', display_name: 'Ver Tickets', description: 'Puede ver tickets del sistema', category: 'tickets', action: 'view' },
  { id: 'tickets.manage', name: 'tickets.manage', display_name: 'Gestionar Tickets', description: 'Puede gestionar tickets', category: 'tickets', action: 'manage' },
  { id: 'payments.view', name: 'payments.view', display_name: 'Ver Pagos', description: 'Puede ver informaciÃ³n de pagos', category: 'payments', action: 'view' },
  { id: 'payments.manage', name: 'payments.manage', display_name: 'Gestionar Pagos', description: 'Puede gestionar pagos', category: 'payments', action: 'manage' },
  { id: 'system.admin', name: 'system.admin', display_name: 'Administrador del Sistema', description: 'Acceso completo al sistema', category: 'system', action: 'admin' }
];

export class UserManagementService {
  private permissions: UserPermission[] = SYSTEM_PERMISSIONS;

  private getDefaultPreferences(): UserProfile['preferences'] {
    return {
      language: 'es',
      timezone: 'America/Argentina/Buenos_Aires',
      theme: 'auto',
      notifications: {
        email: true,
        push: true,
        sms: false
      }
    };
  }

  private mapUserRecord(user: UserProfile): UserProfile {
    return {
      ...user,
      uid: user.id,
      avatar: user.avatar ?? user.avatar_url,
      display_name: user.display_name ?? user.full_name,
      displayName: user.displayName ?? user.display_name ?? user.full_name,
      status: user.status ?? 'active',
      preferences: user.preferences ?? this.getDefaultPreferences(),
      metadata: user.metadata ?? {
        lastLogin: user.last_login ?? null,
        loginCount: user.login_count ?? 0,
        createdAt: user.created_at
      }
    };
  }

  private mapRoleRecord(role: UserRole): UserRole {
    return {
      ...role,
      isDefault: role.isDefault ?? role.is_system
    };
  }

  private mapInvitationRecord(invitation: UserInvitation): UserInvitation {
    return {
      ...invitation,
      role: invitation.role ?? invitation.role_id,
      invitedBy: invitation.invitedBy ?? invitation.invited_by,
      expiresAt: invitation.expiresAt ?? invitation.expires_at
    };
  }

  private mapAuditLogRecord(log: AuditLog): AuditLog {
    const details = log.details ?? {};
    const resource =
      typeof details.resource === 'string'
        ? details.resource
        : typeof details.entity === 'string'
          ? details.entity
          : typeof details.module === 'string'
            ? details.module
            : 'system';

    return {
      ...log,
      userId: log.userId ?? log.user_id,
      resource: log.resource ?? resource,
      timestamp: log.timestamp ?? log.created_at
    };
  }

  // Obtener todos los usuarios
  public async getUsers(filters?: UserFilters, sort?: UserSort, page: number = 1, limit: number = 50): Promise<{ users: UserProfile[]; total: number; page: number; totalPages: number }> {
    const { data: allUsers, error: countError } = await supabase
      .from('users')
      .select('id, email, full_name, role, avatar_url, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (countError) {
      throw new Error(`Error de Supabase: ${countError.message}`);
    }

    if (!allUsers || allUsers.length === 0) {
      return { users: [], total: 0, page: 1, totalPages: 0 };
    }

    let filteredUsers = allUsers.map(user => this.mapUserRecord(user as UserProfile));

    if (filters?.role && filters.role !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.role === filters.role);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredUsers = filteredUsers.filter(user =>
        user.email.toLowerCase().includes(searchLower) ||
        (user.full_name && user.full_name.toLowerCase().includes(searchLower))
      );
    }

    if (sort?.field && sort?.direction) {
      filteredUsers.sort((a, b) => {
        const field = sort.field as keyof UserProfile;
        const aValue = a[field];
        const bValue = b[field];
        const normalizedA = aValue ?? '';
        const normalizedB = bValue ?? '';

        if (sort.direction === 'asc') {
          return normalizedA > normalizedB ? 1 : -1;
        }

        return normalizedA < normalizedB ? 1 : -1;
      });
    } else {
      filteredUsers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    const total = filteredUsers.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    return {
      users: paginatedUsers,
      total,
      page,
      totalPages
    };
  }

  // Obtener un usuario por ID
  public async getUserById(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data ? this.mapUserRecord(data as UserProfile) : null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  // Crear un nuevo usuario
  public async createUser(userData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          email: userData.email!,
          full_name: userData.full_name || null,
          role: userData.role || 'user',
          avatar_url: userData.avatar_url || null
        }])
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado correctamente.",
      });

      return this.mapUserRecord(data as UserProfile);
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el usuario.",
        variant: "destructive",
      });
      throw error;
    }
  }

  // Actualizar un usuario
  public async updateUser(userId: string, userData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          email: userData.email,
          full_name: userData.full_name ?? userData.display_name ?? userData.displayName ?? null,
          role: userData.role,
          avatar_url: userData.avatar_url ?? userData.avatar ?? null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Usuario actualizado",
        description: "El usuario ha sido actualizado correctamente.",
      });

      return this.mapUserRecord(data as UserProfile);
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el usuario.",
        variant: "destructive",
      });
      throw error;
    }
  }

  // Eliminar un usuario
  public async deleteUser(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado correctamente.",
      });

      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el usuario.",
        variant: "destructive",
      });
      return false;
    }
  }

  // Obtener roles del sistema
  public async getRoles(): Promise<UserRole[]> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(role => this.mapRoleRecord(role as UserRole));
    } catch (error) {
      console.error('Error getting roles:', error);
      return [];
    }
  }

  // Crear un nuevo rol
  public async createRole(roleData: Partial<UserRole>): Promise<UserRole> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .insert([{
          name: roleData.name!,
          display_name: roleData.display_name ?? roleData.name!,
          description: roleData.description || null,
          permissions: roleData.permissions || [],
          is_system: false,
          can_delete: true,
          can_edit: true
        }])
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Rol creado",
        description: "El rol ha sido creado correctamente.",
      });

      return this.mapRoleRecord(data as UserRole);
    } catch (error) {
      console.error('Error creating role:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el rol.",
        variant: "destructive",
      });
      throw error;
    }
  }

  // Actualizar un rol
  public async updateRole(roleId: string, roleData: Partial<UserRole>): Promise<UserRole> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .update({
          name: roleData.name,
          display_name: roleData.display_name ?? roleData.name,
          description: roleData.description,
          permissions: roleData.permissions,
          updated_at: new Date().toISOString()
        })
        .eq('id', roleId)
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Rol actualizado",
        description: "El rol ha sido actualizado correctamente.",
      });

      return this.mapRoleRecord(data as UserRole);
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el rol.",
        variant: "destructive",
      });
      throw error;
    }
  }

  // Eliminar un rol
  public async deleteRole(roleId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;
      
      toast({
        title: "Rol eliminado",
        description: "El rol ha sido eliminado correctamente.",
      });

      return true;
    } catch (error) {
      console.error('Error deleting role:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el rol.",
        variant: "destructive",
      });
      return false;
    }
  }

  // Obtener invitaciones
  public async getInvitations(): Promise<UserInvitation[]> {
    try {
      const { data, error } = await supabase
        .from('user_invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(invitation => this.mapInvitationRecord(invitation as UserInvitation));
    } catch (error) {
      console.error('Error getting invitations:', error);
      handleSupabaseError(error, 'Obtener invitaciones');
      return [];
    }
  }

  // Crear una invitaciÃ³n
  public async createInvitation(invitationData: Partial<UserInvitation>): Promise<UserInvitation> {
    try {
      // Obtener el usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Verificar que el usuario tiene permisos de administrador
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (userError || !userData) {
        throw new Error('No se pudo verificar el rol del usuario');
      }

      if (userData.role !== 'admin') {
        throw new Error('Solo los administradores pueden crear invitaciones');
      }

      const token = this.generateToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expira en 7 dÃ­as

      const { data, error } = await supabase
        .from('user_invitations')
        .insert([{
          email: invitationData.email!,
          role_id: invitationData.role_id ?? invitationData.role ?? null,
          invited_by: user.id, // Usar el ID del usuario actual
          status: 'pending',
          token: token,
          expires_at: expiresAt.toISOString(),
          message: invitationData.message || null
        }])
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "InvitaciÃ³n enviada",
        description: "La invitaciÃ³n ha sido enviada correctamente.",
      });

      return this.mapInvitationRecord(data as UserInvitation);
    } catch (error) {
      console.error('Error creating invitation:', error);
      handleSupabaseError(error, 'Crear invitaciÃ³n');
      throw error;
    }
  }

  public async acceptInvitation(token: string, _userData: AcceptInvitationData): Promise<UserInvitation> {
    try {
      const { data: invitation, error: invitationError } = await supabase
        .from('user_invitations')
        .select('*')
        .eq('token', token)
        .single();

      if (invitationError || !invitation) {
        throw invitationError ?? new Error('InvitaciÃ³n no encontrada');
      }

      const expiresAt = new Date(invitation.expires_at);
      if (invitation.status !== 'pending' || expiresAt < new Date()) {
        throw new Error('La invitaciÃ³n ya no es vÃ¡lida');
      }

      const { data, error } = await supabase
        .from('user_invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', invitation.id)
        .select()
        .single();

      if (error) throw error;
      return this.mapInvitationRecord(data as UserInvitation);
    } catch (error) {
      console.error('Error accepting invitation:', error);
      handleSupabaseError(error, 'Aceptar invitaciÃ³n');
      throw error;
    }
  }

  // Obtener logs de auditorÃ­a
  public async getAuditLogs(userId?: string, limit: number = 100): Promise<AuditLog[]> {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []).map(log => this.mapAuditLogRecord(log as AuditLog));
    } catch (error) {
      console.error('Error getting audit logs:', error);
      return [];
    }
  }

  // Crear log de auditorÃ­a
  public async createAuditLog(logData: Partial<AuditLog>): Promise<AuditLog> {
    try {
              const { data, error } = await supabase
        .from('audit_logs')
        .insert([{
          user_id: logData.user_id!,
          action: logData.action!,
          details: logData.details || {},
          ip_address: logData.ip_address || null,
          user_agent: logData.user_agent || null
        }])
          .select()
          .single();

      if (error) throw error;
      return this.mapAuditLogRecord(data as AuditLog);
    } catch (error) {
      console.error('Error creating audit log:', error);
      throw error;
    }
  }

  // Obtener estadÃ­sticas de usuarios
  public async getUserStats(): Promise<{
    total: number;
    admins: number;
    users: number;
    active: number;
    inactive: number;
  }> {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('id, role, created_at');

      if (error) throw error;

      const total = users?.length || 0;
      const admins = users?.filter(u => u.role === 'admin').length || 0;
      const regularUsers = users?.filter(u => u.role === 'user').length || 0;
      
      // Considerar usuarios activos si se crearon en los Ãºltimos 30 dÃ­as
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const active = users?.filter(u => new Date(u.created_at) > thirtyDaysAgo).length || 0;
      const inactive = total - active;

      return {
        total,
        admins,
        users: regularUsers,
        active,
        inactive
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        total: 0,
        admins: 0,
        users: 0,
        active: 0,
        inactive: 0
      };
    }
  }

  // Verificar permisos de un usuario
  public async checkUserPermissions(userId: string, permission: string): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      if (!user) return false;

      // Los administradores tienen todos los permisos
      if (user.role === 'admin') return true;

      // Para usuarios regulares, verificar permisos especÃ­ficos
      const userRole = await this.getUserRole(userId);
      if (!userRole) return false;

      return userRole.permissions.includes(permission);
    } catch (error) {
      console.error('Error checking user permissions:', error);
      return false;
    }
  }

  // Obtener el rol de un usuario
  private async getUserRole(userId: string): Promise<UserRole | null> {
    try {
      // Por ahora, asumimos que los usuarios regulares tienen permisos bÃ¡sicos
      // En el futuro, esto se puede expandir para usar la tabla user_roles
      return {
        id: 'basic-user',
        name: 'basic-user',
        display_name: 'Usuario BÃ¡sico',
        description: 'Usuario con permisos bÃ¡sicos',
        permissions: ['projects.view', 'tickets.view'],
        is_system: true,
        can_delete: false,
        can_edit: false,
        created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  }

  // Generar token para invitaciones
  private generateToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Obtener permisos del sistema
  public getSystemPermissions(): UserPermission[] {
    return this.permissions;
  }

  public getAllPermissions(): UserPermission[] {
    return this.permissions;
  }

  // Obtener permisos por categorÃ­a
  public getPermissionsByCategory(category: string): UserPermission[] {
    return this.permissions.filter(p => p.category === category);
  }
}

// Instancia singleton del servicio
export const userManagementService = new UserManagementService();


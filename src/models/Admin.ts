export interface IAdmin {
  id: string;
  userId: string; // Reference to the User document
  email: string;
  name: string;
  permissions: AdminPermission[];
  role: AdminRole;
  createdBy?: string; // ID of admin who created this admin
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export enum AdminRole {
  SUPER_ADMIN = 'super_admin', // Can do everything including creating admins
  ADMIN = 'admin',             // Can manage users and businesses
  MODERATOR = 'moderator'      // Limited permissions
}

export enum AdminPermission {
  // User Management
  APPROVE_USER = 'approve_user',
  REJECT_USER = 'reject_user', 
  DELETE_USER = 'delete_user',
  EDIT_USER = 'edit_user',
  VIEW_ALL_USERS = 'view_all_users',
  
  // Business Management
  DELETE_BUSINESS = 'delete_business',
  EDIT_BUSINESS = 'edit_business',
  VIEW_ALL_BUSINESSES = 'view_all_businesses',
  
  // Admin Management
  CREATE_ADMIN = 'create_admin',
  DELETE_ADMIN = 'delete_admin',
  EDIT_ADMIN_PERMISSIONS = 'edit_admin_permissions',
  
  // System Management
  VIEW_ANALYTICS = 'view_analytics',
  MANAGE_TAGS = 'manage_tags',
  SYSTEM_SETTINGS = 'system_settings'
}

// Predefined permission sets for different roles
export const ROLE_PERMISSIONS = {
  [AdminRole.SUPER_ADMIN]: [
    AdminPermission.APPROVE_USER,
    AdminPermission.REJECT_USER,
    AdminPermission.DELETE_USER,
    AdminPermission.EDIT_USER,
    AdminPermission.VIEW_ALL_USERS,
    AdminPermission.DELETE_BUSINESS,
    AdminPermission.EDIT_BUSINESS,
    AdminPermission.VIEW_ALL_BUSINESSES,
    AdminPermission.CREATE_ADMIN,
    AdminPermission.DELETE_ADMIN,
    AdminPermission.EDIT_ADMIN_PERMISSIONS,
    AdminPermission.VIEW_ANALYTICS,
    AdminPermission.MANAGE_TAGS,
    AdminPermission.SYSTEM_SETTINGS
  ],
  [AdminRole.ADMIN]: [
    AdminPermission.APPROVE_USER,
    AdminPermission.REJECT_USER,
    AdminPermission.DELETE_USER,
    AdminPermission.EDIT_USER,
    AdminPermission.VIEW_ALL_USERS,
    AdminPermission.DELETE_BUSINESS,
    AdminPermission.EDIT_BUSINESS,
    AdminPermission.VIEW_ALL_BUSINESSES,
    AdminPermission.VIEW_ANALYTICS,
    AdminPermission.MANAGE_TAGS
  ],
  [AdminRole.MODERATOR]: [
    AdminPermission.APPROVE_USER,
    AdminPermission.REJECT_USER,
    AdminPermission.VIEW_ALL_USERS,
    AdminPermission.VIEW_ALL_BUSINESSES
  ]
};

export class Admin implements IAdmin {
  public id: string;
  public userId: string;
  public email: string;
  public name: string;
  public permissions: AdminPermission[];
  public role: AdminRole;
  public createdBy?: string;
  public createdAt: Date;
  public updatedAt: Date;
  public isActive: boolean;

  constructor(data: Partial<IAdmin> = {}) {
    this.id = data.id || '';
    this.userId = data.userId || '';
    this.email = data.email || '';
    this.name = data.name || '';
    this.permissions = data.permissions || [];
    this.role = data.role || AdminRole.MODERATOR;
    this.createdBy = data.createdBy;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.isActive = data.isActive ?? true;
  }

  public hasPermission(permission: AdminPermission): boolean {
    return this.isActive && this.permissions.includes(permission);
  }

  public hasAnyPermission(permissions: AdminPermission[]): boolean {
    return this.isActive && permissions.some(permission => this.permissions.includes(permission));
  }

  public isSuperAdmin(): boolean {
    return this.isActive && this.role === AdminRole.SUPER_ADMIN;
  }

  public canManageUsers(): boolean {
    return this.hasAnyPermission([
      AdminPermission.APPROVE_USER,
      AdminPermission.REJECT_USER,
      AdminPermission.DELETE_USER,
      AdminPermission.EDIT_USER
    ]);
  }

  public canManageBusinesses(): boolean {
    return this.hasAnyPermission([
      AdminPermission.DELETE_BUSINESS,
      AdminPermission.EDIT_BUSINESS
    ]);
  }

  public canManageAdmins(): boolean {
    return this.hasAnyPermission([
      AdminPermission.CREATE_ADMIN,
      AdminPermission.DELETE_ADMIN,
      AdminPermission.EDIT_ADMIN_PERMISSIONS
    ]);
  }

  public setRole(role: AdminRole): void {
    this.role = role;
    this.permissions = [...ROLE_PERMISSIONS[role]];
    this.updatedAt = new Date();
  }

  public addPermission(permission: AdminPermission): void {
    if (!this.permissions.includes(permission)) {
      this.permissions.push(permission);
      this.updatedAt = new Date();
    }
  }

  public removePermission(permission: AdminPermission): void {
    const index = this.permissions.indexOf(permission);
    if (index > -1) {
      this.permissions.splice(index, 1);
      this.updatedAt = new Date();
    }
  }

  public deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  public activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  public toFirestore(): Record<string, unknown> {
    return {
      userId: this.userId,
      email: this.email,
      name: this.name,
      permissions: this.permissions,
      role: this.role,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isActive: this.isActive
    };
  }

  public static fromFirestore(id: string, data: Record<string, unknown>): Admin {
    return new Admin({
      id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    });
  }
}
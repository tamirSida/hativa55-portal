import { Admin, IAdmin, AdminRole, AdminPermission, ROLE_PERMISSIONS } from '@/models/Admin';
import { BaseService } from './BaseService';
import { where, orderBy, QueryConstraint } from 'firebase/firestore';
import { UserService } from './UserService';
import { BusinessService } from './BusinessService';

export class AdminService extends BaseService<Admin> {
  private userService: UserService;
  private businessService: BusinessService;

  constructor() {
    super('admins');
    this.userService = new UserService();
    this.businessService = new BusinessService();
  }

  protected fromFirestore(id: string, data: Record<string, unknown>): Admin {
    return Admin.fromFirestore(id, data);
  }

  // ===== Admin Management =====

  public async createAdmin(
    adminData: Omit<IAdmin, 'id' | 'createdAt' | 'updatedAt'>,
    createdBy: string
  ): Promise<string> {
    const admin = new Admin({
      ...adminData,
      createdBy,
      permissions: ROLE_PERMISSIONS[adminData.role] || []
    });
    
    // IMPORTANT: Use the userId (Firebase UID) as the document ID
    // This ensures Firestore security rules work correctly
    if (!adminData.userId) {
      throw new Error('userId is required to create admin document');
    }
    
    const adminFirestoreData = admin.toFirestore() as Omit<Admin, 'id'>;
    await this.createWithId(adminData.userId, adminFirestoreData);
    return adminData.userId;
  }

  public async getAdminByEmail(email: string): Promise<Admin | null> {
    const admins = await this.getByField('email', email);
    return admins.length > 0 ? admins[0] : null;
  }

  public async getAdminByUserId(userId: string): Promise<Admin | null> {
    // First try to get by document ID (preferred method)
    try {
      const admin = await this.getById(userId);
      if (admin && admin.isActive) return admin;
    } catch (error) {
      // Document doesn't exist with that ID
    }

    // Fallback: search by userId field
    const admins = await this.getByField('userId', userId);
    return admins.length > 0 && admins[0].isActive ? admins[0] : null;
  }

  public async getAllActiveAdmins(): Promise<Admin[]> {
    // Use getAll() and filter in memory to avoid index requirements
    const allAdmins = await this.getAll();
    return allAdmins.filter(admin => admin.isActive);
  }

  public async getAdminsByRole(role: AdminRole): Promise<Admin[]> {
    // Use getAll() and filter in memory to avoid index requirements
    const allAdmins = await this.getAll();
    return allAdmins.filter(admin => admin.role === role).sort((a, b) => a.name.localeCompare(b.name));
  }

  public async updateAdminPermissions(
    adminId: string,
    permissions: AdminPermission[]
  ): Promise<void> {
    const admin = await this.getById(adminId);
    if (!admin) throw new Error('Admin not found');

    admin.permissions = permissions;
    admin.updatedAt = new Date();

    await this.update(adminId, {
      permissions: admin.permissions,
      updatedAt: admin.updatedAt
    });
  }

  public async changeAdminRole(adminId: string, role: AdminRole): Promise<void> {
    const admin = await this.getById(adminId);
    if (!admin) throw new Error('Admin not found');

    admin.setRole(role);
    await this.update(adminId, {
      role: admin.role,
      permissions: admin.permissions,
      updatedAt: admin.updatedAt
    });
  }

  public async deactivateAdmin(adminId: string): Promise<void> {
    const admin = await this.getById(adminId);
    if (!admin) throw new Error('Admin not found');

    admin.deactivate();
    await this.update(adminId, {
      isActive: admin.isActive,
      updatedAt: admin.updatedAt
    });
  }

  // ===== User Management Actions =====

  public async approveUser(adminId: string, userId: string): Promise<void> {
    const admin = await this.getById(adminId);
    if (!admin || !admin.hasPermission(AdminPermission.APPROVE_USER)) {
      throw new Error('Admin does not have permission to approve users');
    }

    await this.userService.approveUser(userId, adminId);
  }

  public async rejectUser(
    adminId: string,
    userId: string,
    reason?: string
  ): Promise<void> {
    const admin = await this.getById(adminId);
    if (!admin || !admin.hasPermission(AdminPermission.REJECT_USER)) {
      throw new Error('Admin does not have permission to reject users');
    }

    await this.userService.rejectUser(userId, adminId, reason);
  }

  public async deleteUser(adminId: string, userId: string): Promise<void> {
    const admin = await this.getById(adminId);
    if (!admin || !admin.hasPermission(AdminPermission.DELETE_USER)) {
      throw new Error('Admin does not have permission to delete users');
    }

    // Delete user's businesses first
    const user = await this.userService.getById(userId);
    if (user?.businessId) {
      await this.businessService.delete(user.businessId);
    }

    // Delete user
    await this.userService.delete(userId);
  }

  public async updateUser(
    adminId: string,
    userId: string,
    updates: Partial<any>
  ): Promise<void> {
    const admin = await this.getById(adminId);
    if (!admin || !admin.hasPermission(AdminPermission.EDIT_USER)) {
      throw new Error('Admin does not have permission to edit users');
    }

    await this.userService.update(userId, updates);
  }

  // ===== Business Management Actions =====

  public async deleteBusiness(adminId: string, businessId: string): Promise<void> {
    const admin = await this.getById(adminId);
    if (!admin || !admin.hasPermission(AdminPermission.DELETE_BUSINESS)) {
      throw new Error('Admin does not have permission to delete businesses');
    }

    await this.businessService.delete(businessId);
  }

  public async updateBusiness(
    adminId: string,
    businessId: string,
    updates: Partial<any>
  ): Promise<void> {
    const admin = await this.getById(adminId);
    if (!admin || !admin.hasPermission(AdminPermission.EDIT_BUSINESS)) {
      throw new Error('Admin does not have permission to edit businesses');
    }

    await this.businessService.update(businessId, updates);
  }

  // ===== Analytics & Reports =====

  public async getPendingUsersCount(): Promise<number> {
    const pendingUsers = await this.userService.getPendingUsers();
    return pendingUsers.length;
  }

  public async getTotalUsersCount(): Promise<number> {
    const users = await this.userService.getApprovedUsers();
    return users.length;
  }

  public async getTotalBusinessesCount(): Promise<number> {
    const businesses = await this.businessService.getActiveBusinesses();
    return businesses.length;
  }

  // ===== Permission Checks =====

  public async checkAdminPermission(
    userId: string,
    permission: AdminPermission
  ): Promise<boolean> {
    const admin = await this.getAdminByUserId(userId);
    return admin ? admin.hasPermission(permission) : false;
  }

  public async isUserAdmin(userId: string): Promise<boolean> {
    const admin = await this.getAdminByUserId(userId);
    return admin ? admin.isActive : false;
  }

  public async getUserAdminRole(userId: string): Promise<AdminRole | null> {
    const admin = await this.getAdminByUserId(userId);
    return admin ? admin.role : null;
  }

  // ===== Setup Functions =====

  public async createFirstSuperAdmin(
    email: string,
    name: string,
    userId: string
  ): Promise<string> {
    // Check if any super admin exists
    const existingSuperAdmins = await this.getAdminsByRole(AdminRole.SUPER_ADMIN);
    if (existingSuperAdmins.length > 0) {
      throw new Error('Super admin already exists');
    }

    const adminData: Omit<IAdmin, 'id' | 'createdAt' | 'updatedAt'> = {
      userId,
      email,
      name,
      role: AdminRole.SUPER_ADMIN,
      permissions: ROLE_PERMISSIONS[AdminRole.SUPER_ADMIN],
      isActive: true
    };

    return await this.createAdmin(adminData, 'system');
  }
}
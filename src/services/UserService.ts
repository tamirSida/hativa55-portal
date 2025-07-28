import { User, IUser, UserStatus } from '@/models/User';
import { BaseService } from './BaseService';
import { where, orderBy, QueryConstraint, deleteField } from 'firebase/firestore';

export class UserService extends BaseService<User> {
  constructor() {
    super('users');
  }

  protected fromFirestore(id: string, data: Record<string, unknown>): User {
    return User.fromFirestore(id, data);
  }

  public async createUser(userData: Omit<IUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const user = new User({ ...userData, status: UserStatus.PENDING });
    return await this.create(user.toFirestore() as Omit<User, 'id'>);
  }

  public async createUserWithId(userId: string, userData: Omit<IUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const user = new User({ ...userData, status: UserStatus.PENDING });
    await this.createWithId(userId, user.toFirestore() as Omit<User, 'id'>);
  }

  public async getUserByIdentityId(identityId: string): Promise<User | null> {
    const users = await this.getByField('identityId', identityId);
    return users.length > 0 ? users[0] : null;
  }

  public async getUserByEmail(email: string): Promise<User | null> {
    const users = await this.getByField('email', email);
    return users.length > 0 ? users[0] : null;
  }

  public async getUsersByTag(
    tagType: 'canOffer' | 'lookingFor' | 'interests', 
    tagValue: string
  ): Promise<User[]> {
    try {
      const allUsers = await this.getAll();
      return allUsers.filter(user => 
        user.tags[tagType] && user.tags[tagType].includes(tagValue)
      );
    } catch (error) {
      throw new Error(`Failed to get users by tag: ${error}`);
    }
  }

  public async getUsersByUniversity(university: string): Promise<User[]> {
    return await this.getByField('university', university, [orderBy('name')]);
  }

  public async getUsersByField(field: string): Promise<User[]> {
    return await this.getByField('field', field, [orderBy('name')]);
  }

  public async searchUsers(searchTerm: string): Promise<User[]> {
    try {
      const allUsers = await this.getAll();
      const lowercaseSearch = searchTerm.toLowerCase();
      
      return allUsers.filter(user => 
        user.name.toLowerCase().includes(lowercaseSearch) ||
        (user.university && user.university.toLowerCase().includes(lowercaseSearch)) ||
        (user.field && user.field.toLowerCase().includes(lowercaseSearch)) ||
        (user.bio && user.bio.toLowerCase().includes(lowercaseSearch)) ||
        user.tags.canOffer.some(tag => tag.toLowerCase().includes(lowercaseSearch)) ||
        user.tags.lookingFor.some(tag => tag.toLowerCase().includes(lowercaseSearch)) ||
        user.tags.interests.some(tag => tag.toLowerCase().includes(lowercaseSearch))
      );
    } catch (error) {
      throw new Error(`Failed to search users: ${error}`);
    }
  }

  public async updateUserProfile(
    userId: string, 
    updates: Partial<Pick<IUser, 'name' | 'bio' | 'businessId' | 'profilePictureUrl' | 'profilePicturePublicId' | 'originalProfilePictureUrl' | 'originalProfilePicturePublicId'>>
  ): Promise<void> {
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };
    
    await this.update(userId, updateData);
  }

  public async updateProfilePicture(
    userId: string,
    profilePictureUrl: string,
    profilePicturePublicId: string,
    originalProfilePictureUrl: string,
    originalProfilePicturePublicId: string
  ): Promise<void> {
    await this.updateUserProfile(userId, {
      profilePictureUrl,
      profilePicturePublicId,
      originalProfilePictureUrl,
      originalProfilePicturePublicId
    });
  }

  public async removeProfilePicture(userId: string): Promise<void> {
    await this.update(userId, {
      profilePictureUrl: deleteField(),
      profilePicturePublicId: deleteField(),
      originalProfilePictureUrl: deleteField(),
      originalProfilePicturePublicId: deleteField(),
      updatedAt: new Date()
    });
  }

  public async addUserTag(
    userId: string, 
    tagType: 'canOffer' | 'lookingFor' | 'interests', 
    tag: string
  ): Promise<void> {
    const user = await this.getById(userId);
    if (!user) throw new Error('User not found');

    user.addTag(tagType, tag);
    await this.update(userId, { tags: user.tags, updatedAt: user.updatedAt });
  }

  public async removeUserTag(
    userId: string, 
    tagType: 'canOffer' | 'lookingFor' | 'interests', 
    tag: string
  ): Promise<void> {
    const user = await this.getById(userId);
    if (!user) throw new Error('User not found');

    user.removeTag(tagType, tag);
    await this.update(userId, { tags: user.tags, updatedAt: user.updatedAt });
  }

  public async linkUserToBusiness(userId: string, businessId: string): Promise<void> {
    const user = await this.getById(userId);
    if (!user) throw new Error('User not found');

    user.addBusiness(businessId);
    await this.update(userId, { businesses: user.businesses, updatedAt: user.updatedAt });
  }

  public async unlinkUserFromBusiness(userId: string, businessId: string): Promise<void> {
    const user = await this.getById(userId);
    if (!user) throw new Error('User not found');

    user.removeBusiness(businessId);
    await this.update(userId, { businesses: user.businesses, updatedAt: user.updatedAt });
  }

  public async getMentors(): Promise<User[]> {
    try {
      const allUsers = await this.getAll();
      return allUsers.filter(user => 
        user.tags.canOffer && user.tags.canOffer.length > 0
      );
    } catch (error) {
      throw new Error(`Failed to get mentors: ${error}`);
    }
  }

  public async getUsersLookingFor(service: string): Promise<User[]> {
    return await this.getUsersByTag('lookingFor', service);
  }

  public async getUsersWithInterest(interest: string): Promise<User[]> {
    return await this.getUsersByTag('interests', interest);
  }

  public async getPendingUsers(): Promise<User[]> {
    // Remove orderBy to avoid composite index requirement - will sort client-side
    const users = await this.getByField('status', UserStatus.PENDING);
    // Sort by createdAt on client side
    return users.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  public async getApprovedUsers(): Promise<User[]> {
    // Remove orderBy to avoid composite index requirement - will sort client-side
    const users = await this.getByField('status', UserStatus.APPROVED);
    // Sort by name on client side
    return users.sort((a, b) => a.name.localeCompare(b.name, 'he'));
  }

  public async getUsersByStatus(status: UserStatus): Promise<User[]> {
    // Remove orderBy to avoid composite index requirement - will sort client-side
    const users = await this.getByField('status', status);
    // Sort by createdAt (desc) on client side
    return users.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public async approveUser(userId: string, approverId: string): Promise<void> {
    const user = await this.getById(userId);
    if (!user) throw new Error('User not found');

    user.approve(approverId);
    await this.update(userId, {
      status: user.status,
      approvedBy: user.approvedBy,
      approvedAt: user.approvedAt,
      updatedAt: user.updatedAt
    });
  }

  public async rejectUser(userId: string, rejectorId: string, reason?: string): Promise<void> {
    const user = await this.getById(userId);
    if (!user) throw new Error('User not found');

    user.reject(rejectorId, reason);
    await this.update(userId, {
      status: user.status,
      rejectedBy: user.rejectedBy,
      rejectedAt: user.rejectedAt,
      rejectionReason: user.rejectionReason,
      updatedAt: user.updatedAt
    });
  }

  public async suspendUser(userId: string, suspenderId: string, reason?: string): Promise<void> {
    const user = await this.getById(userId);
    if (!user) throw new Error('User not found');

    user.suspend(suspenderId, reason);
    await this.update(userId, {
      status: user.status,
      rejectedBy: user.rejectedBy,
      rejectedAt: user.rejectedAt,
      rejectionReason: user.rejectionReason,
      updatedAt: user.updatedAt
    });
  }

  public async isIdentityIdAvailable(identityId: string): Promise<boolean> {
    const existingUser = await this.getUserByIdentityId(identityId);
    return !existingUser;
  }
}
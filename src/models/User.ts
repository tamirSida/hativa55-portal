export interface IUser {
  id: string;
  email: string;
  name: string;
  identityId: string;
  phone?: string;
  city?: string;
  gdud?: string;
  bio?: string;
  profilePictureUrl?: string;
  profilePicturePublicId?: string;
  originalProfilePictureUrl?: string;
  originalProfilePicturePublicId?: string;
  hobbyTags: string[];
  mentorTags: string[];
  businessId?: string;
  educationIds: string[];
  status: UserStatus;
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended'
}

export enum Gdud {
  MAFCHATZ = 'מפח״ט',
  GDUD_66 = '66',
  GDUD_71 = '71', 
  GDUD_28 = '28',
  GDESAR = 'גדס״ר',
  PLATZAT = 'פלת״צ'
}

export class User implements IUser {
  public id: string;
  public email: string;
  public name: string;
  public identityId: string;
  public phone?: string;
  public city?: string;
  public gdud?: string;
  public bio?: string;
  public profilePictureUrl?: string;
  public profilePicturePublicId?: string;
  public originalProfilePictureUrl?: string;
  public originalProfilePicturePublicId?: string;
  public hobbyTags: string[];
  public mentorTags: string[];
  public businessId?: string;
  public educationIds: string[];
  public status: UserStatus;
  public approvedBy?: string;
  public approvedAt?: Date;
  public rejectedBy?: string;
  public rejectedAt?: Date;
  public rejectionReason?: string;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(data: Partial<IUser>) {
    this.id = data.id || '';
    this.email = data.email || '';
    this.name = data.name || '';
    this.identityId = data.identityId || '';
    this.phone = data.phone;
    this.city = data.city;
    this.gdud = data.gdud;
    this.bio = data.bio;
    this.profilePictureUrl = data.profilePictureUrl;
    this.profilePicturePublicId = data.profilePicturePublicId;
    this.originalProfilePictureUrl = data.originalProfilePictureUrl;
    this.originalProfilePicturePublicId = data.originalProfilePicturePublicId;
    this.hobbyTags = data.hobbyTags || [];
    this.mentorTags = data.mentorTags || [];
    this.businessId = data.businessId;
    this.educationIds = data.educationIds || [];
    this.status = data.status || UserStatus.PENDING;
    this.approvedBy = data.approvedBy;
    this.approvedAt = data.approvedAt;
    this.rejectedBy = data.rejectedBy;
    this.rejectedAt = data.rejectedAt;
    this.rejectionReason = data.rejectionReason;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  public addHobbyTag(tag: string): void {
    if (!this.hobbyTags.includes(tag)) {
      this.hobbyTags.push(tag);
      this.updatedAt = new Date();
    }
  }

  public removeHobbyTag(tag: string): void {
    const index = this.hobbyTags.indexOf(tag);
    if (index > -1) {
      this.hobbyTags.splice(index, 1);
      this.updatedAt = new Date();
    }
  }

  public addMentorTag(tag: string): void {
    if (!this.mentorTags.includes(tag)) {
      this.mentorTags.push(tag);
      this.updatedAt = new Date();
    }
  }

  public removeMentorTag(tag: string): void {
    const index = this.mentorTags.indexOf(tag);
    if (index > -1) {
      this.mentorTags.splice(index, 1);
      this.updatedAt = new Date();
    }
  }

  public setBusiness(businessId?: string): void {
    this.businessId = businessId;
    this.updatedAt = new Date();
  }

  public addEducation(educationId: string): void {
    if (!this.educationIds.includes(educationId)) {
      this.educationIds.push(educationId);
      this.updatedAt = new Date();
    }
  }

  public removeEducation(educationId: string): void {
    const index = this.educationIds.indexOf(educationId);
    if (index > -1) {
      this.educationIds.splice(index, 1);
      this.updatedAt = new Date();
    }
  }

  public updateContactInfo(phone?: string): void {
    this.phone = phone;
    this.updatedAt = new Date();
  }

  public updateLocation(city?: string, gdud?: string): void {
    this.city = city;
    this.gdud = gdud;
    this.updatedAt = new Date();
  }

  public approve(approverId: string): void {
    this.status = UserStatus.APPROVED;
    this.approvedBy = approverId;
    this.approvedAt = new Date();
    this.updatedAt = new Date();
  }

  public reject(rejectorId: string, reason?: string): void {
    this.status = UserStatus.REJECTED;
    this.rejectedBy = rejectorId;
    this.rejectedAt = new Date();
    this.rejectionReason = reason;
    this.updatedAt = new Date();
  }

  public suspend(suspenderId: string, reason?: string): void {
    this.status = UserStatus.SUSPENDED;
    this.rejectedBy = suspenderId;
    this.rejectedAt = new Date();
    this.rejectionReason = reason;
    this.updatedAt = new Date();
  }

  public isApproved(): boolean {
    return this.status === UserStatus.APPROVED;
  }

  public isPending(): boolean {
    return this.status === UserStatus.PENDING;
  }

  public isRejected(): boolean {
    return this.status === UserStatus.REJECTED;
  }

  public isSuspended(): boolean {
    return this.status === UserStatus.SUSPENDED;
  }

  public hasBusiness(): boolean {
    return !!this.businessId;
  }

  public hasEducation(): boolean {
    return this.educationIds.length > 0;
  }

  public isMentor(): boolean {
    return this.mentorTags.length > 0;
  }

  public isAdmin(): boolean {
    // This will be checked via AdminService in auth context
    return false; // Placeholder - will be overridden by context
  }

  public updateProfilePicture(url?: string, publicId?: string, originalUrl?: string, originalPublicId?: string): void {
    this.profilePictureUrl = url;
    this.profilePicturePublicId = publicId;
    this.originalProfilePictureUrl = originalUrl;
    this.originalProfilePicturePublicId = originalPublicId;
    this.updatedAt = new Date();
  }

  public removeProfilePicture(): void {
    this.profilePictureUrl = undefined;
    this.profilePicturePublicId = undefined;
    this.originalProfilePictureUrl = undefined;
    this.originalProfilePicturePublicId = undefined;
    this.updatedAt = new Date();
  }

  public hasProfilePicture(): boolean {
    return !!this.profilePictureUrl;
  }

  public toFirestore(): Record<string, unknown> {
    const data: Record<string, unknown> = {
      email: this.email,
      name: this.name,
      identityId: this.identityId,
      phone: this.phone || '',
      city: this.city || '',
      gdud: this.gdud || '',
      bio: this.bio || '',
      profilePictureUrl: this.profilePictureUrl || '',
      profilePicturePublicId: this.profilePicturePublicId || '',
      originalProfilePictureUrl: this.originalProfilePictureUrl || '',
      originalProfilePicturePublicId: this.originalProfilePicturePublicId || '',
      hobbyTags: this.hobbyTags || [],
      mentorTags: this.mentorTags || [],
      businessId: this.businessId || '',
      educationIds: this.educationIds || [],
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };

    // Add optional approval fields only if they exist
    if (this.approvedBy) data.approvedBy = this.approvedBy;
    if (this.approvedAt) data.approvedAt = this.approvedAt;
    if (this.rejectedBy) data.rejectedBy = this.rejectedBy;
    if (this.rejectedAt) data.rejectedAt = this.rejectedAt;
    if (this.rejectionReason) data.rejectionReason = this.rejectionReason;

    return data;
  }

  public static fromFirestore(id: string, data: Record<string, unknown>): User {
    return new User({
      id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    });
  }
}
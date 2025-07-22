export interface IJob {
  id: string;
  posterId: string;
  title: string;
  description: string;
  requirements?: string;
  benefits?: string;
  location: JobLocation;
  employmentType: EmploymentType;
  field: string;
  tags: string[];
  contactInfo: JobContactInfo;
  businessId?: string;
  companyName: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

export interface JobLocation {
  type: 'remote' | 'hybrid' | 'onsite';
  city?: string;
  address?: string;
  wazeUrl?: string;
}

export interface JobContactInfo {
  email?: string;
  phone?: string;
  applicationUrl?: string;
  contactPersonName?: string;
}

export enum EmploymentType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  FREELANCE = 'freelance',
  INTERNSHIP = 'internship',
}

export class Job implements IJob {
  public id: string;
  public posterId: string;
  public title: string;
  public description: string;
  public requirements?: string;
  public benefits?: string;
  public location: JobLocation;
  public employmentType: EmploymentType;
  public field: string;
  public tags: string[];
  public contactInfo: JobContactInfo;
  public businessId?: string;
  public companyName: string;
  public isActive: boolean;
  public createdAt: Date;
  public updatedAt: Date;
  public expiresAt?: Date;

  constructor(data: Partial<IJob>) {
    this.id = data.id || '';
    this.posterId = data.posterId || '';
    this.title = data.title || '';
    this.description = data.description || '';
    this.requirements = data.requirements;
    this.benefits = data.benefits;
    this.location = data.location || { type: 'onsite' };
    this.employmentType = data.employmentType || EmploymentType.FULL_TIME;
    this.field = data.field || '';
    this.tags = data.tags || [];
    this.contactInfo = data.contactInfo || {};
    this.businessId = data.businessId;
    this.companyName = data.companyName || '';
    this.isActive = data.isActive ?? true;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.expiresAt = data.expiresAt;
  }

  public updateLocation(newLocation: Partial<JobLocation>): void {
    this.location = { ...this.location, ...newLocation };
    this.updatedAt = new Date();
  }

  public addTag(tag: string): void {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
      this.updatedAt = new Date();
    }
  }

  public removeTag(tag: string): void {
    const index = this.tags.indexOf(tag);
    if (index > -1) {
      this.tags.splice(index, 1);
      this.updatedAt = new Date();
    }
  }

  public updateContactInfo(newContactInfo: Partial<JobContactInfo>): void {
    this.contactInfo = { ...this.contactInfo, ...newContactInfo };
    this.updatedAt = new Date();
  }

  public linkToBusiness(businessId: string): void {
    this.businessId = businessId;
    this.updatedAt = new Date();
  }

  public unlinkFromBusiness(): void {
    this.businessId = undefined;
    this.updatedAt = new Date();
  }

  public toggleActive(): void {
    this.isActive = !this.isActive;
    this.updatedAt = new Date();
  }

  public setExpiration(date: Date): void {
    this.expiresAt = date;
    this.updatedAt = new Date();
  }

  public isExpired(): boolean {
    return this.expiresAt ? new Date() > this.expiresAt : false;
  }

  public toFirestore(): Record<string, any> {
    return {
      posterId: this.posterId,
      title: this.title,
      description: this.description,
      requirements: this.requirements,
      benefits: this.benefits,
      location: this.location,
      employmentType: this.employmentType,
      field: this.field,
      tags: this.tags,
      contactInfo: this.contactInfo,
      businessId: this.businessId,
      companyName: this.companyName,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      expiresAt: this.expiresAt,
    };
  }

  public static fromFirestore(id: string, data: any): Job {
    return new Job({
      id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      expiresAt: data.expiresAt?.toDate(),
    });
  }
}
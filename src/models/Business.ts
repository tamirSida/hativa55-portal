export interface IBusiness {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  wazeUrl?: string;
  serviceAreas?: string[];
  serviceTags: string[];
  jobPostings: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessContactInfo {
  phone?: string;
  email?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
}

export class Business implements IBusiness {
  public id: string;
  public ownerId: string;
  public name: string;
  public description: string;
  public wazeUrl?: string;
  public serviceAreas?: string[];
  public serviceTags: string[];
  public jobPostings: string[];
  public isActive: boolean;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(data: Partial<IBusiness>) {
    this.id = data.id || '';
    this.ownerId = data.ownerId || '';
    this.name = data.name || '';
    this.description = data.description || '';
    this.wazeUrl = data.wazeUrl;
    this.serviceAreas = data.serviceAreas;
    this.serviceTags = data.serviceTags || [];
    this.jobPostings = data.jobPostings || [];
    this.isActive = data.isActive ?? true;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  public updateLocation(wazeUrl?: string, serviceAreas?: string[]): void {
    this.wazeUrl = wazeUrl;
    this.serviceAreas = serviceAreas;
    this.updatedAt = new Date();
  }

  public addServiceTag(tag: string): void {
    if (!this.serviceTags.includes(tag)) {
      this.serviceTags.push(tag);
      this.updatedAt = new Date();
    }
  }

  public removeServiceTag(tag: string): void {
    const index = this.serviceTags.indexOf(tag);
    if (index > -1) {
      this.serviceTags.splice(index, 1);
      this.updatedAt = new Date();
    }
  }

  public addJobPosting(jobId: string): void {
    if (!this.jobPostings.includes(jobId)) {
      this.jobPostings.push(jobId);
      this.updatedAt = new Date();
    }
  }

  public removeJobPosting(jobId: string): void {
    const index = this.jobPostings.indexOf(jobId);
    if (index > -1) {
      this.jobPostings.splice(index, 1);
      this.updatedAt = new Date();
    }
  }

  public hasPhysicalLocation(): boolean {
    return !!this.wazeUrl;
  }

  public isServiceProvider(): boolean {
    return !!(this.serviceAreas && this.serviceAreas.length > 0);
  }

  public isValidBusiness(): boolean {
    return this.hasPhysicalLocation() || this.isServiceProvider();
  }

  public toggleActive(): void {
    this.isActive = !this.isActive;
    this.updatedAt = new Date();
  }

  public toFirestore(): Record<string, any> {
    return {
      ownerId: this.ownerId,
      name: this.name,
      description: this.description,
      wazeUrl: this.wazeUrl,
      serviceAreas: this.serviceAreas,
      serviceTags: this.serviceTags,
      jobPostings: this.jobPostings,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public static fromFirestore(id: string, data: any): Business {
    return new Business({
      id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    });
  }
}
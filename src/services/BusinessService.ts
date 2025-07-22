import { Business, IBusiness } from '@/models/Business';
import { BaseService } from './BaseService';
import { where, orderBy, QueryConstraint } from 'firebase/firestore';

export class BusinessService extends BaseService<Business> {
  constructor() {
    super('businesses');
  }

  protected fromFirestore(id: string, data: any): Business {
    return Business.fromFirestore(id, data);
  }

  public async createBusiness(businessData: Omit<IBusiness, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const business = new Business(businessData);
    return await this.create(business.toFirestore() as Omit<Business, 'id'>);
  }

  public async getBusinessesByOwner(ownerId: string): Promise<Business[]> {
    return await this.getByField('ownerId', ownerId, [orderBy('name')]);
  }

  public async getActiveBusinesses(): Promise<Business[]> {
    return await this.getByField('isActive', true, [orderBy('name')]);
  }

  public async getBusinessesByCategory(category: string): Promise<Business[]> {
    return await this.getByField('category', category, [
      where('isActive', '==', true),
      orderBy('name')
    ]);
  }

  public async getBusinessesByTag(tag: string): Promise<Business[]> {
    try {
      const allBusinesses = await this.getActiveBusinesses();
      return allBusinesses.filter(business => 
        business.tags.includes(tag)
      );
    } catch (error) {
      throw new Error(`Failed to get businesses by tag: ${error}`);
    }
  }

  public async getServiceProviders(): Promise<Business[]> {
    try {
      const allBusinesses = await this.getActiveBusinesses();
      return allBusinesses.filter(business => 
        business.location.isServiceProvider
      );
    } catch (error) {
      throw new Error(`Failed to get service providers: ${error}`);
    }
  }

  public async getBusinessesInServiceArea(area: string): Promise<Business[]> {
    try {
      const serviceProviders = await this.getServiceProviders();
      return serviceProviders.filter(business => 
        business.location.serviceAreas && 
        business.location.serviceAreas.includes(area)
      );
    } catch (error) {
      throw new Error(`Failed to get businesses in service area: ${error}`);
    }
  }

  public async searchBusinesses(searchTerm: string): Promise<Business[]> {
    try {
      const allBusinesses = await this.getActiveBusinesses();
      const lowercaseSearch = searchTerm.toLowerCase();
      
      return allBusinesses.filter(business => 
        business.name.toLowerCase().includes(lowercaseSearch) ||
        business.description.toLowerCase().includes(lowercaseSearch) ||
        business.category.toLowerCase().includes(lowercaseSearch) ||
        business.tags.some(tag => tag.toLowerCase().includes(lowercaseSearch))
      );
    } catch (error) {
      throw new Error(`Failed to search businesses: ${error}`);
    }
  }

  public async updateBusinessProfile(
    businessId: string, 
    updates: Partial<Pick<IBusiness, 'name' | 'description' | 'category' | 'location' | 'contactInfo' | 'logo'>>
  ): Promise<void> {
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };
    
    await this.update(businessId, updateData);
  }

  public async addBusinessTag(businessId: string, tag: string): Promise<void> {
    const business = await this.getById(businessId);
    if (!business) throw new Error('Business not found');

    business.addTag(tag);
    await this.update(businessId, { tags: business.tags, updatedAt: business.updatedAt });
  }

  public async removeBusinessTag(businessId: string, tag: string): Promise<void> {
    const business = await this.getById(businessId);
    if (!business) throw new Error('Business not found');

    business.removeTag(tag);
    await this.update(businessId, { tags: business.tags, updatedAt: business.updatedAt });
  }

  public async toggleBusinessStatus(businessId: string): Promise<void> {
    const business = await this.getById(businessId);
    if (!business) throw new Error('Business not found');

    business.toggleActive();
    await this.update(businessId, { isActive: business.isActive, updatedAt: business.updatedAt });
  }

  public async linkJobToBusiness(businessId: string, jobId: string): Promise<void> {
    const business = await this.getById(businessId);
    if (!business) throw new Error('Business not found');

    business.addJobPosting(jobId);
    await this.update(businessId, { jobPostings: business.jobPostings, updatedAt: business.updatedAt });
  }

  public async unlinkJobFromBusiness(businessId: string, jobId: string): Promise<void> {
    const business = await this.getById(businessId);
    if (!business) throw new Error('Business not found');

    business.removeJobPosting(jobId);
    await this.update(businessId, { jobPostings: business.jobPostings, updatedAt: business.updatedAt });
  }

  public async updateBusinessLocation(
    businessId: string, 
    location: Partial<IBusiness['location']>
  ): Promise<void> {
    const business = await this.getById(businessId);
    if (!business) throw new Error('Business not found');

    business.updateLocation(location);
    await this.update(businessId, { location: business.location, updatedAt: business.updatedAt });
  }

  public async getBusinessesWithJobs(): Promise<Business[]> {
    try {
      const allBusinesses = await this.getActiveBusinesses();
      return allBusinesses.filter(business => 
        business.jobPostings.length > 0
      );
    } catch (error) {
      throw new Error(`Failed to get businesses with jobs: ${error}`);
    }
  }
}
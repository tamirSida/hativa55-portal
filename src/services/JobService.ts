import { Job, IJob, EmploymentType } from '@/models/Job';
import { BaseService } from './BaseService';
import { where, orderBy, QueryConstraint } from 'firebase/firestore';

export class JobService extends BaseService<Job> {
  constructor() {
    super('jobs');
  }

  protected fromFirestore(id: string, data: any): Job {
    return Job.fromFirestore(id, data);
  }

  public async createJob(jobData: Omit<IJob, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const job = new Job(jobData);
    return await this.create(job.toFirestore() as Omit<Job, 'id'>);
  }

  public async getActiveJobs(): Promise<Job[]> {
    return await this.getByField('isActive', true, [orderBy('createdAt', 'desc')]);
  }

  public async getJobsByPoster(posterId: string): Promise<Job[]> {
    return await this.getByField('posterId', posterId, [orderBy('createdAt', 'desc')]);
  }

  public async getJobsByBusiness(businessId: string): Promise<Job[]> {
    return await this.getByField('businessId', businessId, [
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    ]);
  }

  public async getJobsByField(field: string): Promise<Job[]> {
    return await this.getByField('field', field, [
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    ]);
  }

  public async getJobsByEmploymentType(employmentType: EmploymentType): Promise<Job[]> {
    return await this.getByField('employmentType', employmentType, [
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    ]);
  }

  public async getJobsByLocation(locationType: 'remote' | 'hybrid' | 'onsite'): Promise<Job[]> {
    return await this.getByField('location.type', locationType, [
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    ]);
  }

  public async getJobsByTag(tag: string): Promise<Job[]> {
    try {
      const allJobs = await this.getActiveJobs();
      return allJobs.filter(job => 
        job.tags.includes(tag)
      );
    } catch (error) {
      throw new Error(`Failed to get jobs by tag: ${error}`);
    }
  }

  public async getJobsByCity(city: string): Promise<Job[]> {
    try {
      const allJobs = await this.getActiveJobs();
      return allJobs.filter(job => 
        job.location.city === city || 
        job.location.type === 'remote'
      );
    } catch (error) {
      throw new Error(`Failed to get jobs by city: ${error}`);
    }
  }

  public async searchJobs(searchTerm: string): Promise<Job[]> {
    try {
      const allJobs = await this.getActiveJobs();
      const lowercaseSearch = searchTerm.toLowerCase();
      
      return allJobs.filter(job => 
        job.title.toLowerCase().includes(lowercaseSearch) ||
        job.description.toLowerCase().includes(lowercaseSearch) ||
        job.companyName.toLowerCase().includes(lowercaseSearch) ||
        job.field.toLowerCase().includes(lowercaseSearch) ||
        (job.requirements && job.requirements.toLowerCase().includes(lowercaseSearch)) ||
        job.tags.some(tag => tag.toLowerCase().includes(lowercaseSearch))
      );
    } catch (error) {
      throw new Error(`Failed to search jobs: ${error}`);
    }
  }

  public async updateJobPost(
    jobId: string, 
    updates: Partial<Pick<IJob, 'title' | 'description' | 'requirements' | 'benefits' | 'location' | 'contactInfo'>>
  ): Promise<void> {
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };
    
    await this.update(jobId, updateData);
  }

  public async addJobTag(jobId: string, tag: string): Promise<void> {
    const job = await this.getById(jobId);
    if (!job) throw new Error('Job not found');

    job.addTag(tag);
    await this.update(jobId, { tags: job.tags, updatedAt: job.updatedAt });
  }

  public async removeJobTag(jobId: string, tag: string): Promise<void> {
    const job = await this.getById(jobId);
    if (!job) throw new Error('Job not found');

    job.removeTag(tag);
    await this.update(jobId, { tags: job.tags, updatedAt: job.updatedAt });
  }

  public async toggleJobStatus(jobId: string): Promise<void> {
    const job = await this.getById(jobId);
    if (!job) throw new Error('Job not found');

    job.toggleActive();
    await this.update(jobId, { isActive: job.isActive, updatedAt: job.updatedAt });
  }

  public async linkJobToBusiness(jobId: string, businessId: string): Promise<void> {
    const job = await this.getById(jobId);
    if (!job) throw new Error('Job not found');

    job.linkToBusiness(businessId);
    await this.update(jobId, { businessId: job.businessId, updatedAt: job.updatedAt });
  }

  public async unlinkJobFromBusiness(jobId: string): Promise<void> {
    const job = await this.getById(jobId);
    if (!job) throw new Error('Job not found');

    job.unlinkFromBusiness();
    await this.update(jobId, { businessId: undefined, updatedAt: job.updatedAt });
  }

  public async setJobExpiration(jobId: string, expiresAt: Date): Promise<void> {
    const job = await this.getById(jobId);
    if (!job) throw new Error('Job not found');

    job.setExpiration(expiresAt);
    await this.update(jobId, { expiresAt: job.expiresAt, updatedAt: job.updatedAt });
  }

  public async getExpiredJobs(): Promise<Job[]> {
    try {
      const allJobs = await this.getAll();
      return allJobs.filter(job => job.isExpired());
    } catch (error) {
      throw new Error(`Failed to get expired jobs: ${error}`);
    }
  }

  public async getRecentJobs(limit = 10): Promise<Job[]> {
    return await this.getByField('isActive', true, [
      orderBy('createdAt', 'desc')
    ]);
  }

  public async getRemoteJobs(): Promise<Job[]> {
    return await this.getJobsByLocation('remote');
  }

  public async getJobsWithoutBusiness(): Promise<Job[]> {
    try {
      const allJobs = await this.getActiveJobs();
      return allJobs.filter(job => !job.businessId);
    } catch (error) {
      throw new Error(`Failed to get jobs without business: ${error}`);
    }
  }
}
import { Education, IEducation, EducationStatus } from '@/models/Education';
import { BaseService } from './BaseService';
import { where, orderBy, QueryConstraint } from 'firebase/firestore';

export class EducationService extends BaseService<Education> {
  constructor() {
    super('education');
  }

  protected fromFirestore(id: string, data: Record<string, unknown>): Education {
    return Education.fromFirestore(id, data);
  }

  public async createEducation(educationData: Omit<IEducation, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const education = new Education(educationData);
    return await this.create(education.toFirestore() as Omit<Education, 'id'>);
  }

  public async getEducationByUser(userId: string): Promise<Education[]> {
    return await this.getByField('userId', userId, [orderBy('yearExpected', 'desc'), orderBy('yearCompleted', 'desc')]);
  }

  public async getEducationByInstitution(institutionName: string): Promise<Education[]> {
    return await this.getByField('institutionName', institutionName, [orderBy('yearCompleted', 'desc')]);
  }

  public async getEducationByStatus(status: EducationStatus): Promise<Education[]> {
    return await this.getByField('status', status, [orderBy('yearExpected', 'desc')]);
  }

  public async getCurrentStudents(): Promise<Education[]> {
    return await this.getEducationByStatus(EducationStatus.IN_PROGRESS);
  }

  public async getGraduates(): Promise<Education[]> {
    return await this.getEducationByStatus(EducationStatus.COMPLETED);
  }

  public async getEducationByDegree(degreeOrCertificate: string): Promise<Education[]> {
    try {
      const allEducation = await this.getAll();
      return allEducation.filter(education =>
        education.degreeOrCertificate.toLowerCase().includes(degreeOrCertificate.toLowerCase())
      );
    } catch (error) {
      throw new Error(`Failed to get education by degree: ${error}`);
    }
  }

  public async getUsersWithUniversityJob(): Promise<Education[]> {
    try {
      const allEducation = await this.getAll();
      return allEducation.filter(education => education.uniJobTitle);
    } catch (error) {
      throw new Error(`Failed to get users with university jobs: ${error}`);
    }
  }

  public async searchEducation(searchTerm: string): Promise<Education[]> {
    try {
      const allEducation = await this.getAll();
      const lowercaseSearch = searchTerm.toLowerCase();
      
      return allEducation.filter(education =>
        education.institutionName.toLowerCase().includes(lowercaseSearch) ||
        education.degreeOrCertificate.toLowerCase().includes(lowercaseSearch) ||
        (education.uniJobTitle && education.uniJobTitle.toLowerCase().includes(lowercaseSearch))
      );
    } catch (error) {
      throw new Error(`Failed to search education: ${error}`);
    }
  }

  public async updateEducationStatus(educationId: string, status: EducationStatus): Promise<void> {
    const education = await this.getById(educationId);
    if (!education) throw new Error('Education not found');

    education.updateStatus(status);
    await this.update(educationId, {
      status: education.status,
      yearCompleted: education.yearCompleted,
      updatedAt: education.updatedAt
    });
  }

  public async updateEducationJobTitle(educationId: string, jobTitle?: string): Promise<void> {
    const education = await this.getById(educationId);
    if (!education) throw new Error('Education not found');

    education.updateJobTitle(jobTitle);
    await this.update(educationId, {
      uniJobTitle: education.uniJobTitle,
      updatedAt: education.updatedAt
    });
  }

  public async getEducationByYearRange(startYear: number, endYear: number): Promise<Education[]> {
    try {
      const allEducation = await this.getAll();
      return allEducation.filter(education => {
        const year = education.yearCompleted || education.yearExpected;
        return year && year >= startYear && year <= endYear;
      });
    } catch (error) {
      throw new Error(`Failed to get education by year range: ${error}`);
    }
  }

  public async deleteEducation(educationId: string): Promise<void> {
    await this.delete(educationId);
  }

  public async deleteEducationsForUser(userId: string): Promise<void> {
    const userEducation = await this.getEducationByUser(userId);
    
    for (const education of userEducation) {
      await this.delete(education.id);
    }
  }

  public async getEducationStatistics(): Promise<{
    totalEducation: number;
    currentStudents: number;
    graduates: number;
    planned: number;
    withUniJobs: number;
    topInstitutions: { name: string; count: number }[];
    topDegrees: { name: string; count: number }[];
  }> {
    try {
      const allEducation = await this.getAll();
      
      const currentStudents = allEducation.filter(e => e.status === EducationStatus.IN_PROGRESS).length;
      const graduates = allEducation.filter(e => e.status === EducationStatus.COMPLETED).length;
      const planned = allEducation.filter(e => e.status === EducationStatus.PLANNED).length;
      const withUniJobs = allEducation.filter(e => e.uniJobTitle).length;

      // Count institutions
      const institutionCounts = allEducation.reduce((acc, education) => {
        acc[education.institutionName] = (acc[education.institutionName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Count degrees
      const degreeCounts = allEducation.reduce((acc, education) => {
        acc[education.degreeOrCertificate] = (acc[education.degreeOrCertificate] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topInstitutions = Object.entries(institutionCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const topDegrees = Object.entries(degreeCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        totalEducation: allEducation.length,
        currentStudents,
        graduates,
        planned,
        withUniJobs,
        topInstitutions,
        topDegrees
      };
    } catch (error) {
      throw new Error(`Failed to get education statistics: ${error}`);
    }
  }
}
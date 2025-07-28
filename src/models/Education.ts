import educationOptions from '@/config/educationOptions.json';
import type { EducationOptions } from '@/config/types';

export interface IEducation {
  id: string;
  userId: string;
  institutionName: string;
  degreeOrCertificate: string;
  yearCompleted?: number;
  yearExpected?: number;
  status: EducationStatus;
  uniJobTitle?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum EducationStatus {
  COMPLETED = 'completed',
  IN_PROGRESS = 'in_progress',
  PLANNED = 'planned'
}

export class Education implements IEducation {
  public id: string;
  public userId: string;
  public institutionName: string;
  public degreeOrCertificate: string;
  public yearCompleted?: number;
  public yearExpected?: number;
  public status: EducationStatus;
  public uniJobTitle?: string;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(data: Partial<IEducation>) {
    this.id = data.id || '';
    this.userId = data.userId || '';
    this.institutionName = data.institutionName || '';
    this.degreeOrCertificate = data.degreeOrCertificate || '';
    this.yearCompleted = data.yearCompleted;
    this.yearExpected = data.yearExpected;
    this.status = data.status || EducationStatus.IN_PROGRESS;
    this.uniJobTitle = data.uniJobTitle;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  public updateStatus(status: EducationStatus): void {
    this.status = status;
    this.updatedAt = new Date();
    
    if (status === EducationStatus.COMPLETED && !this.yearCompleted && this.yearExpected) {
      this.yearCompleted = this.yearExpected;
    }
  }

  public updateJobTitle(jobTitle?: string): void {
    this.uniJobTitle = jobTitle;
    this.updatedAt = new Date();
  }

  public isCurrentStudent(): boolean {
    return this.status === EducationStatus.IN_PROGRESS;
  }

  public isGraduate(): boolean {
    return this.status === EducationStatus.COMPLETED;
  }

  public getDisplayYear(): string {
    if (this.status === EducationStatus.COMPLETED && this.yearCompleted) {
      return `סיים ב-${this.yearCompleted}`;
    }
    if (this.status === EducationStatus.IN_PROGRESS && this.yearExpected) {
      return `צפוי לסיים ב-${this.yearExpected}`;
    }
    if (this.status === EducationStatus.PLANNED && this.yearExpected) {
      return `מתכנן להתחיל ב-${this.yearExpected}`;
    }
    return '';
  }

  public toFirestore(): Record<string, unknown> {
    const data: Record<string, unknown> = {
      userId: this.userId,
      institutionName: this.institutionName,
      degreeOrCertificate: this.degreeOrCertificate,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };

    // Only add optional fields if they have values
    if (this.yearCompleted !== undefined) {
      data.yearCompleted = this.yearCompleted;
    }
    if (this.yearExpected !== undefined) {
      data.yearExpected = this.yearExpected;
    }
    if (this.uniJobTitle !== undefined && this.uniJobTitle !== '') {
      data.uniJobTitle = this.uniJobTitle;
    }

    return data;
  }

  public static fromFirestore(id: string, data: Record<string, unknown>): Education {
    return new Education({
      id,
      userId: data.userId as string,
      institutionName: data.institutionName as string,
      degreeOrCertificate: data.degreeOrCertificate as string,
      status: data.status as EducationStatus,
      yearCompleted: data.yearCompleted as number | undefined,
      yearExpected: data.yearExpected as number | undefined,
      uniJobTitle: data.uniJobTitle as string | undefined,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    });
  }
}

export class EducationManager {
  private static options: EducationOptions = educationOptions;

  public static getCommonInstitutions(): string[] {
    return [...this.options.institutions].sort((a, b) => a.localeCompare(b, 'he'));
  }

  public static getCommonDegrees(): string[] {
    return [...this.options.degrees].sort((a, b) => a.localeCompare(b, 'he'));
  }

  public static getUniJobs(): string[] {
    return [...this.options.universityJobs].sort((a, b) => a.localeCompare(b, 'he'));
  }

  public static getAllOptions(): EducationOptions {
    return this.options;
  }

  public static isValidYear(year: number): boolean {
    const currentYear = new Date().getFullYear();
    return year >= 1950 && year <= currentYear + 10;
  }

  public static createEducation(
    userId: string,
    institutionName: string,
    degreeOrCertificate: string,
    status: EducationStatus = EducationStatus.IN_PROGRESS
  ): Education {
    return new Education({
      userId,
      institutionName,
      degreeOrCertificate,
      status
    });
  }
}
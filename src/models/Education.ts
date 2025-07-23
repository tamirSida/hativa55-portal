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
    return {
      userId: this.userId,
      institutionName: this.institutionName,
      degreeOrCertificate: this.degreeOrCertificate,
      yearCompleted: this.yearCompleted,
      yearExpected: this.yearExpected,
      status: this.status,
      uniJobTitle: this.uniJobTitle,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public static fromFirestore(id: string, data: Record<string, unknown>): Education {
    return new Education({
      id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    });
  }
}

export class EducationManager {
  private static commonInstitutions: string[] = [
    'אוניברסיטת תל אביב',
    'האוניברסיטה העברית',
    'טכניון',
    'אוניברסיטת בר אילן',
    'אוניברסיטת בן גוריון',
    'אוניברסיטת חיפה',
    'אוניברסיטת אריאל',
    'רייכמן (IDC)',
    'המכללה האקדמית תל אביב',
    'המכון הטכנולוגי חולון',
    'מכון עזריאלי',
    'מכללת ספיר',
    'בצלאל',
    'שנקר',
    'John Bryce',
    'Coursera',
    'Udemy',
    'יחידת תלפיות',
    'ממ״ן',
    'בית ספר לטכנולוגיה על שם אפקה'
  ];

  private static commonDegrees: string[] = [
    'תואר ראשון במדעי המחשב',
    'תואר ראשון בהנדסת תוכנה',
    'תואר ראשון בכלכלה',
    'תואר ראשון בניהול',
    'תואר ראשון בפסיכולוגיה',
    'תואר ראשון בחינוך',
    'תואר ראשון במשפטים',
    'תואר ראשון ברפואה',
    'תואר שני במנהל עסקים (MBA)',
    'תואר שני במדעי המחשב',
    'תואר שלישי (דוקטורט)',
    'קורס פיתוח Full Stack',
    'קורס Data Science',
    'קורס UX/UI',
    'קורס Digital Marketing',
    'קורס Project Management',
    'הסמכת PMP',
    'הסמכת AWS',
    'הסמכת Google Analytics',
    'קורס חשבונאות'
  ];

  private static uniJobs: string[] = [
    'יו״ר אגודת סטודנטים',
    'מתרגל',
    'מחקר',
    'עוזר הוראה',
    'חבר מועצה',
    'מנהיג סטודנטיאלי',
    'חבר ועדה אקדמית',
    'מתנדב באירועים',
    'עיתונאי בעיתון סטודנטים'
  ];

  public static getCommonInstitutions(): string[] {
    return this.commonInstitutions;
  }

  public static getCommonDegrees(): string[] {
    return this.commonDegrees;
  }

  public static getUniJobs(): string[] {
    return this.uniJobs;
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
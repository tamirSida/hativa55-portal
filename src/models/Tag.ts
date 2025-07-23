export interface ITag {
  id: string;
  name: string;
  category: TagCategory;
  description?: string;
  usageCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum TagCategory {
  SKILL = 'skill',
  INTEREST = 'interest',
  INDUSTRY = 'industry',
  SERVICE = 'service',
  JOB_TYPE = 'job_type',
  UNIVERSITY = 'university',
  FIELD = 'field',
}

export class Tag implements ITag {
  public id: string;
  public name: string;
  public category: TagCategory;
  public description?: string;
  public usageCount: number;
  public isActive: boolean;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(data: Partial<ITag>) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.category = data.category || TagCategory.SKILL;
    this.description = data.description;
    this.usageCount = data.usageCount || 0;
    this.isActive = data.isActive ?? true;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  public incrementUsage(): void {
    this.usageCount++;
    this.updatedAt = new Date();
  }

  public decrementUsage(): void {
    if (this.usageCount > 0) {
      this.usageCount--;
      this.updatedAt = new Date();
    }
  }

  public toggleActive(): void {
    this.isActive = !this.isActive;
    this.updatedAt = new Date();
  }

  public updateDescription(description: string): void {
    this.description = description;
    this.updatedAt = new Date();
  }

  public toFirestore(): Record<string, unknown> {
    return {
      name: this.name,
      category: this.category,
      description: this.description,
      usageCount: this.usageCount,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public static fromFirestore(id: string, data: Record<string, unknown>): Tag {
    return new Tag({
      id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    });
  }
}

export class TagManager {
  private static predefinedTags: Record<TagCategory, string[]> = {
    [TagCategory.SKILL]: [
      'פיתוח תוכנה',
      'שיווק דיגיטלי',
      'עיצוב גרפי',
      'ניהול פרויקטים',
      'מכירות',
      'כתיבה',
      'צילום',
      'חשבונאות',
      'ייעוץ עסקי',
      'הדרכה',
    ],
    [TagCategory.INTEREST]: [
      'יזמות',
      'טכנולוגיה',
      'אומנות',
      'ספורט',
      'בישול',
      'נסיעות',
      'מוסיקה',
      'קריאה',
      'כושר',
      'צילום',
    ],
    [TagCategory.INDUSTRY]: [
      'טכנולוגיה',
      'פיננסים',
      'חינוך',
      'בריאות',
      'נדל"ן',
      'קמעונאות',
      'בידור',
      'משפטים',
      'ייעוץ',
      'שירותי עסקים',
    ],
    [TagCategory.SERVICE]: [
      'ייעוץ',
      'הדרכה',
      'עיצוב',
      'תכנות',
      'שיווק',
      'צילום',
      'כתיבה',
      'תרגום',
      'ניקיון',
      'בישול',
    ],
    [TagCategory.JOB_TYPE]: [
      'מתכנת',
      'מעצב',
      'מנהל פרויקטים',
      'מנהל שיווק',
      'איש מכירות',
      'יועץ',
      'מורה',
      'צלם',
      'כותב תוכן',
      'מחזאי',
    ],
    [TagCategory.UNIVERSITY]: [
      'האוניברסיטה העברית',
      'תל אביב',
      'טכניון',
      'בר אילן',
      'בן גוריון',
      'חיפה',
      'אריאל',
      'רייכמן',
      'המכללה האקדמית תל אביב',
      'המכון הטכנולוגי חולון',
    ],
    [TagCategory.FIELD]: [
      'מדעי המחשב',
      'הנדסה',
      'כלכלה',
      'ניהול',
      'פסיכולוגיה',
      'חינוך',
      'משפטים',
      'רפואה',
      'אמנות',
      'תקשורת',
    ],
  };

  public static getPredefinedTags(category: TagCategory): string[] {
    return this.predefinedTags[category] || [];
  }

  public static getAllPredefinedTags(): Record<TagCategory, string[]> {
    return this.predefinedTags;
  }

  public static createTag(name: string, category: TagCategory, description?: string): Tag {
    return new Tag({
      name,
      category,
      description,
      usageCount: 0,
      isActive: true,
    });
  }

  public static isValidTagName(name: string): boolean {
    return name.trim().length >= 2 && name.trim().length <= 50;
  }
}
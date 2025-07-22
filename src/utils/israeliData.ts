export const ISRAELI_CITIES = [
  'אבן יהודה',
  'אילת', 
  'אלקוש',
  'אשדוד',
  'אשקלון',
  'באר שבע',
  'בית שאן',
  'בית שמש',
  'בני ברק',
  'גבעתיים',
  'גדרה',
  'דימונה',
  'הוד השרון',
  'הרצליה',
  'זכרון יעקב',
  'חדרה',
  'חולון',
  'חיפה',
  'טבריה',
  'יבנה',
  'יקנעם',
  'ירושלים',
  'כפר סבא',
  'לוד',
  'מודיעין',
  'מודיעין מכבים רעות',
  'נהריה',
  'נס ציונה',
  'נתניה',
  'עכו',
  'עפולה',
  'פתח תקווה',
  'צפת',
  'קרית גת',
  'קרית ים',
  'קרית מוצקין',
  'קרית שמונה',
  'ראש העין',
  'ראשון לציון',
  'רחובות',
  'רמלה',
  'רמת גן',
  'רמת השרון',
  'רעננה',
  'שדרות',
  'תל אביב',
  'תל אביב יפו'
];

// Alternative export name for easier importing
export const israeliCities = ISRAELI_CITIES;

export const SERVICE_AREAS = [
  'כל הארץ',
  'גוש דן',
  'השרון',
  'השפלה',
  'מרכז הארץ',
  'ירושלים והסביבה',
  'צפון הארץ',
  'גליל עליון',
  'גליל תחתון',
  'עמק יזרעאל',
  'חיפה והקריות',
  'דרום הארץ',
  'אשקלון והסביבה',
  'באר שבע והנגב',
  'אילת והערבה',
  'יהודה ושומרון',
  'בקעת הירדן',
  'הגולן'
];

export const GDUDIM = [
  'מפח״ט',
  '66',
  '71',
  '28',
  'גדס״ר',
  'פלת״צ'
];

export class PhoneValidator {
  private static readonly ISRAELI_PHONE_REGEX = /^05[0-9]-?\d{7}$/;
  private static readonly LANDLINE_REGEX = /^0[2-4,8-9]-?\d{7}$/;

  public static isValidIsraeliMobile(phone: string): boolean {
    const cleaned = phone.replace(/\s|-/g, '');
    return this.ISRAELI_PHONE_REGEX.test(cleaned);
  }

  public static isValidIsraeliLandline(phone: string): boolean {
    const cleaned = phone.replace(/\s|-/g, '');
    return this.LANDLINE_REGEX.test(cleaned);
  }

  public static isValidIsraeliPhone(phone: string): boolean {
    return this.isValidIsraeliMobile(phone) || this.isValidIsraeliLandline(phone);
  }

  public static formatIsraeliPhone(phone: string): string {
    const cleaned = phone.replace(/\s|-/g, '');
    
    if (this.isValidIsraeliMobile(cleaned)) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    }
    
    if (this.isValidIsraeliLandline(cleaned)) {
      const areaCode = cleaned.slice(0, 2);
      const number = cleaned.slice(2);
      return `${areaCode}-${number}`;
    }
    
    return phone;
  }

  public static getPhoneDisplayName(phone: string): string {
    if (this.isValidIsraeliMobile(phone)) {
      return 'נייד';
    }
    if (this.isValidIsraeliLandline(phone)) {
      return 'קווי';
    }
    return 'טלפון';
  }
}

export class LocationValidator {
  public static isValidIsraeliCity(city: string): boolean {
    return ISRAELI_CITIES.includes(city);
  }

  public static isValidServiceArea(area: string): boolean {
    return SERVICE_AREAS.includes(area);
  }

  public static isValidGdud(gdud: string): boolean {
    return GDUDIM.includes(gdud);
  }

  public static searchCities(query: string): string[] {
    const lowercaseQuery = query.toLowerCase();
    return ISRAELI_CITIES.filter(city => 
      city.toLowerCase().includes(lowercaseQuery)
    ).slice(0, 10);
  }

  public static searchServiceAreas(query: string): string[] {
    const lowercaseQuery = query.toLowerCase();
    return SERVICE_AREAS.filter(area => 
      area.toLowerCase().includes(lowercaseQuery)
    ).slice(0, 10);
  }
}

export const TAG_CATEGORIES = {
  HOBBIES: [
    'כדורגל',
    'כדורסל', 
    'טניס',
    'שחייה',
    'ריצה',
    'כושר',
    'יוגה',
    'גיטרה',
    'פסנתר',
    'שירה',
    'ציור',
    'צילום',
    'קריאה',
    'כתיבה',
    'בישול',
    'אפייה',
    'גינון',
    'נסיעות',
    'הליכה',
    'אופניים',
    'משחקי מחשב',
    'משחקי לוח',
    'סרטים',
    'תיאטרון',
    'קונצרטים'
  ],
  MENTOR_SKILLS: [
    'פיתוח תוכנה',
    'מדעי המחשב',
    'עיצוב גרפי',
    'UX/UI',
    'שיווק דיגיטלי',
    'ניהול פרויקטים',
    'מכירות',
    'חשבונאות',
    'משפטים',
    'רפואה',
    'הנדסה',
    'כלכלה',
    'פסיכולוגיה',
    'חינוך',
    'תרגום',
    'כתיבה יצירתית',
    'עיתונאות',
    'צילום מקצועי',
    'בישול מקצועי',
    'כושר ותזונה',
    'יזמות',
    'הקמת סטארט-אפ',
    'השקעות',
    'נדל״ן',
    'ייעוץ עסקי'
  ],
  BUSINESS_SERVICES: [
    'פיתוח אתרים',
    'פיתוח אפליקציות',
    'עיצוב גרפי',
    'שיווק דיגיטלי',
    'ניהול רשתות חברתיות',
    'צילום אירועים',
    'צילום מוצרים',
    'תרגום',
    'הקלדה',
    'עריכת טקסטים',
    'ייעוץ עסקי',
    'ייעוץ משפטי',
    'חשבונאות',
    'הובלות',
    'ניקיון',
    'בישול לאירועים',
    'DJ לאירועים',
    'הדרכה אישית',
    'חינוך מוסיקלי',
    'שיעורים פרטיים',
    'תיקונים',
    'גינון',
    'אחזקת בתים',
    'יועץ פיננסי',
    'נדל״ן'
  ]
};

export const GDUD_OPTIONS = [
  { value: 'מפח״ט', label: 'מפח״ט' },
  { value: '66', label: 'גדוד 66' },
  { value: '71', label: 'גדוד 71' },
  { value: '28', label: 'גדוד 28' },
  { value: 'גדס״ר', label: 'גדס״ר' },
  { value: 'פלת״צ', label: 'פלת״צ' }
];
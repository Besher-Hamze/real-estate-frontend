export const FLOOR_OPTIONS = [
  { value: '0', label: 'أرضي' },
  { value: '1', label: 'أول' },
  { value: '2', label: 'ثاني' },
  { value: '3', label: 'ثالث' },
  { value: '4', label: 'رابع' },
  { value: '5', label: 'خامس' },
  { value: '6', label: 'سادس' },
  { value: '7', label: 'سابع' },
  { value: '8', label: 'ثامن' },
  { value: '9', label: 'تاسع' },
  { value: '10', label: 'عاشر' },
  { value: '11', label: 'الحادي عشر' },
  { value: '12', label: 'الثاني عشر' },
];


export const FURNISHED_OPTIONS = [
  { value: 0, label: 'غير مفروشة' },
  { value: 1, label: 'مفروشة' },
  { value: 2, label: 'مفروشة جزيئيا' },
];

export const VIEW_OPTIONS = [
  { value: 'بحرية', label: 'بحرية' },
  { value: 'جبلية', label: 'جبلية' },
  { value: 'على الشارع', label: 'على الشارع' },
  { value: 'حديقة داخلية', label: 'حديقة داخلية' },
  { value: 'أمامي', label: 'أمامي' },
  { value: 'جانبي', label: 'جانبي' },
  { value: 'خلفي', label: 'خلفي' },
  { value: 'داخلي', label: 'داخلي' },
  { value: 'مفتوح على 4 جهات', label: 'مفتوح على 4 جهات' },
];

export const RENTAL_DURATION_OPTIONS = [
  { value: '1m', label: 'شهر' },
  { value: '3m', label: 'ثلاث شهور' },
  { value: '6m', label: 'ستة شهور' },
  { value: '1y', label: 'سنة' },
  { value: 'my', label: 'اكثر من سنة' },// more than 1 year
  { value: '1d', label: 'يومي' },
  { value: '1w', label: 'اسبوعي' },
];


export const PAYMENT_OPTIONS = [
  "كاش",
  "شيكات",
  "كاش / تحويل"
];


export const ADDITIONAL_FEATURES = [
  "مصعد",
  "حديقة",
  "موقف سيارات",
  "حارس/أمن وحماية",
  "درج",
  "مخزن",
  "منطقة شواء",
  "نظام كهرباء احتياطي للطوارئ",
  "بركة سباحة",
  "انتركم",
  "انترنت",
  "تسهيلات لأصحاب الهمم",
];


export const FEATURES_BY_TYPE = {
  residential: [
    "تكييف مركزي",
    "مكيف",
    "تدفئة",
    "شرفة/بلكونة",
    "غرفة خادمة",
    "غرفة غسيل",
    "خزائن حائط",
    "مسبح خاص",
    "سخان شمسي",
    "زجاج شبابيك مزدوج",
    "جاكوزي",
    "مطبخ جاهز",
    "اباجورات كهرباء",
    "تدفئة تحت البلاط",
    "عسالة",
    "جلاية صحون",
    "مايكرويف",
    "فرن",
    "ثلاجة",
  ],
  commercial: [
    "تكييف مركزي",
    "بلكونة",
    "زجاج شبابيك مزدوج",
    "مطبخ جاهز",
    "مصعد",
    "مواقف خاصة",
    "حارس",
    "مخزن",
    "انترنت",
    "تسهيل لأصحاب الهمم",
  ],
  industrial: [
    "مصعد",
    "تكييف",
    "كهرباء توتر عالي",
    "منصة تحميل",
    "مواقف خاصة",
    "غرفة حارس",
    "CCTV",
  ],
  others: [
    "مصعد",
    "حديقة",
    "موقف سيارات",
    "حارس /\ أمن وحماية",
    "درج",
    "مخزن",
    "منطقة شواء",
    "نظام كهرباء احتياطي للطوارئ",
    "بركة سباحة",
    "انتركم",
    "انترنت",
    "تسهيلات لأصحاب الهمم",
  ],
};

export const NEARBY_LOCATION = [
  "مطعم",
  "مدرسة",
  "سوبر ماركت",
  "مول / مركز تسوق",
  "صالة رياضية / جيم",
  "مستشفى",
  "مسجد",
  "داري كلين",
  "موقف سيارات",
  "بنك / صراف الالي",
  "صيدلية"
];

export const STATUS_OPTIONS = [
  { value: 'مكتمل', label: 'مكتمل' },
  { value: 'قيد الإنشاء', label: 'قيد الإنشاء' },
  { value: 'مخطط', label: 'مخطط' }
];

export const BUILDING_AGE_OPTION = [
  { value: "0-11,m", label: "0-11 شهر" },
  { value: "1-5,y", label: "1-5 سنوات" },
  { value: "6-9,y", label: "6-9 سنوات" },
  { value: "10-19,y", label: "10-19 سنوات" },
  { value: "20,y", label: "20+ سنة" },
]



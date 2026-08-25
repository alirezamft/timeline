export type WorkStatus = "TODO" | "IN_PROGRESS" | "IN_QA" | "BLOCKED" | "DONE";

export type DemoTask = {
  id: string;
  title: string;
  status: WorkStatus;
  owner: string;
  updatedAt: string;
  addedThisPeriod?: boolean;
  nextPeriod?: boolean;
};

export type DemoStory = {
  id: string;
  title: string;
  tasks: DemoTask[];
};

export type DemoEpic = {
  id: string;
  title: string;
  stories: DemoStory[];
};

export type DemoProject = {
  id: string;
  title: string;
  summary: string;
  goal: string;
  owner: string;
  team: string;
  startMonth: number;
  duration: number;
  stage: "تحویل‌شده" | "در حال توسعه" | "تثبیت" | "QA" | "برنامه‌ریزی";
  health: "ON_TRACK" | "AT_RISK" | "OFF_TRACK";
  target: string;
  metric: string;
  dependencies: string[];
  blockers: string[];
  epics: DemoEpic[];
};

export type DemoProduct = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  color: string;
  objective: string;
  metrics: Array<{ label: string; value: string; target: string; trend: string }>;
  projects: DemoProject[];
};

export const timelineMonths = [
  "خرداد ۱۴۰۵",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
  "فروردین ۱۴۰۶",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان"
];

export const timelineQuarters = [
  { title: "فصل ۱", range: "خرداد–مرداد ۱۴۰۵", start: 0 },
  { title: "فصل ۲", range: "شهریور–آبان ۱۴۰۵", start: 3 },
  { title: "فصل ۳", range: "آذر–بهمن ۱۴۰۵", start: 6 },
  { title: "فصل ۴", range: "اسفند–اردیبهشت ۱۴۰۶", start: 9 },
  { title: "فصل ۵", range: "خرداد–مرداد ۱۴۰۶", start: 12 },
  { title: "فصل ۶", range: "شهریور–آبان ۱۴۰۶", start: 15 }
];

export const statusLabels: Record<WorkStatus, string> = {
  TODO: "شروع‌نشده",
  IN_PROGRESS: "در حال انجام",
  IN_QA: "QA",
  BLOCKED: "بلاکر",
  DONE: "انجام‌شده"
};

export const tradeProducts: DemoProduct[] = [
  {
    id: "advanced-market",
    name: "بازار پیشرفته",
    shortName: "TAMI / TOME",
    description: "زیرساخت سفارش‌گذاری، مچینگ و بازار ۲۴ساعته طلاین",
    color: "#5CC8FF",
    objective: "افزایش سهم معاملات Orderbook با حفظ سلامت بازار و کاهش خطای عملیاتی",
    metrics: [
      { label: "Fill Rate", value: "49.4٪", target: "بیش از 55٪", trend: "+6.8٪" },
      { label: "عمق Top 5", value: "+5kg", target: "7kg", trend: "+12٪" },
      { label: "سلامت بازار", value: "96.8٪", target: "99٪", trend: "+1.4٪" }
    ],
    projects: [
      {
        id: "tami-transition",
        title: "انتقال بازار پیشرفته به دامین Trade",
        summary: "انتقال مالکیت، ریویوی سه‌مسیره و آماده‌سازی انتشار V2",
        goal: "مالکیت کامل محصول و کاهش وابستگی اجرای تغییرات به تیم سامانه",
        owner: "تیم Trade",
        team: "Product · Backend · QA",
        startMonth: 0,
        duration: 3,
        stage: "تثبیت",
        health: "AT_RISK",
        target: "پایان مرداد ۱۴۰۵",
        metric: "بسته‌شدن ۱۰۰٪ موارد P0 و P1",
        dependencies: ["تیم سامانه", "زیرساخت مانیتورینگ"],
        blockers: ["تعیین تکلیف نهایی باگ کنسل وبهوک"],
        epics: [
          {
            id: "transition-review",
            title: "بازبینی و انتقال دانش",
            stories: [
              {
                id: "review-paths",
                title: "تجمیع خروجی سه مسیر Review",
                tasks: [
                  { id: "review-system", title: "بررسی موارد تیم سامانه", status: "DONE", owner: "Product", updatedAt: "این هفته" },
                  { id: "review-ai", title: "بررسی موارد استخراج‌شده با AI", status: "DONE", owner: "Product", updatedAt: "این هفته" },
                  { id: "review-mahshid", title: "بررسی گزارش تست مهشید", status: "DONE", owner: "QA", updatedAt: "این هفته" },
                  { id: "review-triage", title: "Triage و اولویت‌بندی خروجی‌ها", status: "IN_QA", owner: "Product", updatedAt: "امروز", nextPeriod: true }
                ]
              }
            ]
          },
          {
            id: "v2-stabilization",
            title: "انتشار و Stabilization نسخه V2",
            stories: [
              {
                id: "v2-launch",
                title: "انتشار کنترل‌شده نسخه",
                tasks: [
                  { id: "v2-release", title: "انتشار TAMI V2", status: "DONE", owner: "Backend", updatedAt: "۱۵ آگوست" },
                  { id: "v2-monitor", title: "مانیتورینگ Production", status: "IN_PROGRESS", owner: "Trade", updatedAt: "امروز", nextPeriod: true },
                  { id: "v2-reward-bug", title: "رفع باگ جایزه اولین خرید", status: "DONE", owner: "Backend", updatedAt: "این هفته" },
                  { id: "v2-cancel-bug", title: "رفع و Reconcile باگ کنسل وبهوک", status: "BLOCKED", owner: "Backend", updatedAt: "امروز", addedThisPeriod: true }
                ]
              }
            ]
          }
        ]
      },
      {
        id: "matching-engine-v2",
        title: "بازطراحی Matching Engine",
        summary: "Limit استاندارد، Exact، Retry وبهوک و کنترل اثر بازار",
        goal: "اجرای قابل اتکای سفارش و کاهش سفارش‌های ناسازگار یا گیرکرده",
        owner: "تیم Backend Trade",
        team: "Backend · Platform · QA",
        startMonth: 1,
        duration: 5,
        stage: "در حال توسعه",
        health: "ON_TRACK",
        target: "آبان ۱۴۰۵",
        metric: "خطای بحرانی کمتر از ۰.۱٪ سفارش‌ها",
        dependencies: ["Ledger", "Webhook consumers"],
        blockers: [],
        epics: [
          {
            id: "order-core",
            title: "Order Core",
            stories: [
              {
                id: "limit-exact",
                title: "Limit و Exact استاندارد",
                tasks: [
                  { id: "limit-core", title: "منطق اجرای Limit در قیمت بهتر", status: "DONE", owner: "Backend", updatedAt: "هفته قبل" },
                  { id: "exact-core", title: "اجرای Exact فقط در قیمت تعیین‌شده", status: "DONE", owner: "Backend", updatedAt: "هفته قبل" },
                  { id: "order-copy", title: "توضیح تفاوت Exact و Limit در UI", status: "IN_PROGRESS", owner: "Product", updatedAt: "امروز", nextPeriod: true },
                  { id: "order-qa", title: "QA سناریوهای قیمت بهتر و Partial Fill", status: "IN_QA", owner: "QA", updatedAt: "امروز" }
                ]
              }
            ]
          },
          {
            id: "engine-integrity",
            title: "Integrity و Recovery",
            stories: [
              {
                id: "engine-safety",
                title: "محافظ‌های بازار",
                tasks: [
                  { id: "market-impact", title: "Market Impact Guard", status: "DONE", owner: "Backend", updatedAt: "هفته قبل" },
                  { id: "webhook-retry", title: "Webhook Retry", status: "DONE", owner: "Backend", updatedAt: "هفته قبل" },
                  { id: "stuck-orders", title: "پایش سفارش‌های Stuck", status: "IN_PROGRESS", owner: "Data", updatedAt: "امروز" },
                  { id: "recovery-runbook", title: "Runbook بازیابی سفارش", status: "TODO", owner: "Operations", updatedAt: "—", nextPeriod: true }
                ]
              }
            ]
          }
        ]
      },
      {
        id: "tami-growth",
        title: "مانیتورینگ و رشد Adoption",
        summary: "داشبورد سلامت، سگمنت‌بندی و بهبود Retention",
        goal: "افزایش تبدیل کاربران OTC به بازار پیشرفته و حفظ کاربران فعال",
        owner: "Product & Data",
        team: "Product · Data",
        startMonth: 3,
        duration: 6,
        stage: "برنامه‌ریزی",
        health: "ON_TRACK",
        target: "بهمن ۱۴۰۵",
        metric: "Week-1 Retention بیشتر از ۳۰٪",
        dependencies: ["دیتامارت Trade"],
        blockers: [],
        epics: [
          {
            id: "growth-monitoring",
            title: "Growth Analytics",
            stories: [
              {
                id: "growth-dashboard",
                title: "داشبورد Adoption و Retention",
                tasks: [
                  { id: "segment-query", title: "کوئری سگمنت‌های کاربری", status: "DONE", owner: "Data", updatedAt: "هفته قبل" },
                  { id: "retention-query", title: "Retention هفتگی", status: "DONE", owner: "Data", updatedAt: "هفته قبل" },
                  { id: "growth-targets", title: "تعیین Target هر سگمنت", status: "TODO", owner: "Product", updatedAt: "—", nextPeriod: true }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "otc",
    name: "OTC",
    shortName: "Fast Buy / Sell",
    description: "خریدوفروش سریع، همگام‌سازی Orderbook و تأمین نقدشوندگی",
    color: "#70E1A1",
    objective: "تجربه سریع و مطمئن معامله با قیمت رقابتی و نقدشوندگی پایدار",
    metrics: [
      { label: "سهم بات از حجم", value: "4–5٪", target: "8٪", trend: "+1.2٪" },
      { label: "Bot PnL هفتگی", value: "36M", target: "مثبت", trend: "+9٪" },
      { label: "زمان Quote", value: "1.8s", target: "<1s", trend: "-14٪" }
    ],
    projects: [
      {
        id: "otc-sync-bot",
        title: "OTC Sync Bot V1",
        summary: "همگام‌سازی قیمت OTC با Orderbook و تأمین نقدشوندگی",
        goal: "حفظ Orderbook قابل معامله در تمام ساعات شبانه‌روز",
        owner: "Trade Backend",
        team: "Backend · Data · Operations",
        startMonth: 0,
        duration: 4,
        stage: "تثبیت",
        health: "ON_TRACK",
        target: "شهریور ۱۴۰۵",
        metric: "عمق پایدار بیشتر از ۵ کیلوگرم",
        dependencies: ["OTC Price API", "TOME"],
        blockers: [],
        epics: [
          {
            id: "bot-core",
            title: "Bot Core",
            stories: [
              {
                id: "bot-sync",
                title: "سینک قیمت و سفارش",
                tasks: [
                  { id: "bot-price", title: "مانیتور قیمت OTC", status: "DONE", owner: "Backend", updatedAt: "ماه قبل" },
                  { id: "bot-match", title: "شناسایی سفارش قابل تطبیق", status: "DONE", owner: "Backend", updatedAt: "ماه قبل" },
                  { id: "bot-pnl", title: "داشبورد PnL و Exposure", status: "IN_PROGRESS", owner: "Data", updatedAt: "امروز", nextPeriod: true },
                  { id: "bot-ignore", title: "رفع مغایرت سفارش‌های Ignored", status: "IN_QA", owner: "Backend", updatedAt: "امروز" }
                ]
              }
            ]
          }
        ]
      },
      {
        id: "otc-fast-flow",
        title: "بازطراحی Fast Buy / Sell",
        summary: "کاهش اصطکاک جریان خریدوفروش سریع و شفافیت Quote",
        goal: "افزایش نرخ تکمیل خریدوفروش سریع",
        owner: "OTC Product",
        team: "Product · Design · Frontend",
        startMonth: 4,
        duration: 5,
        stage: "برنامه‌ریزی",
        health: "ON_TRACK",
        target: "بهمن ۱۴۰۵",
        metric: "افزایش Conversion به میزان ۱۵٪",
        dependencies: ["Pricer"],
        blockers: [],
        epics: [
          {
            id: "fast-experience",
            title: "Fast Trade Experience",
            stories: [
              {
                id: "fast-quote",
                title: "Quote شفاف و سریع",
                tasks: [
                  { id: "fast-discovery", title: "تحلیل Drop-off فعلی", status: "IN_PROGRESS", owner: "Product", updatedAt: "امروز" },
                  { id: "fast-design", title: "طراحی جریان جدید", status: "TODO", owner: "Design", updatedAt: "—", nextPeriod: true },
                  { id: "fast-fe", title: "پیاده‌سازی تجربه جدید", status: "TODO", owner: "Frontend", updatedAt: "—" }
                ]
              }
            ]
          }
        ]
      },
      {
        id: "multi-provider-liquidity",
        title: "نقدشوندگی چندتأمین‌کننده",
        summary: "Smart Routing، مدیریت موجودی و Dynamic Spread",
        goal: "کاهش ریسک وابستگی به یک منبع و بهبود قیمت قابل اجرا",
        owner: "Trade Platform",
        team: "Backend · Quant · Operations",
        startMonth: 9,
        duration: 7,
        stage: "برنامه‌ریزی",
        health: "ON_TRACK",
        target: "مهر ۱۴۰۶",
        metric: "حداقل ۳ تأمین‌کننده فعال",
        dependencies: ["Pricer V2", "Ledger V2"],
        blockers: [],
        epics: [
          {
            id: "routing-mvp",
            title: "Smart Routing MVP",
            stories: [
              {
                id: "provider-model",
                title: "مدل تأمین‌کننده",
                tasks: [
                  { id: "provider-prd", title: "PRD و قواعد Routing", status: "TODO", owner: "Product", updatedAt: "—" },
                  { id: "provider-tech", title: "Technical Design", status: "TODO", owner: "Backend", updatedAt: "—" }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "traz",
    name: "تراز",
    shortName: "Traz",
    description: "موتور تنظیم و انتشار قیمت دارایی‌ها برای عملیات",
    color: "#C9A84C",
    objective: "کاهش خطای انسانی و وابستگی به Excel در مدیریت قیمت",
    metrics: [
      { label: "معامله روز پرترافیک", value: "400–500", target: "700", trend: "+18٪" },
      { label: "زمان ریشه‌یابی", value: "-60٪", target: "-75٪", trend: "+8٪" },
      { label: "ظرفیت عملیات", value: "+300٪", target: "+400٪", trend: "+24٪" }
    ],
    projects: [
      {
        id: "traz-v2",
        title: "Traz V2 Asset-Agnostic",
        summary: "بازطراحی هسته تراز برای طلا، سکه و دارایی‌های آینده",
        goal: "مدیریت چنددارایی با قواعد مستقل و Audit کامل",
        owner: "Pricing Product",
        team: "Backend · Operations",
        startMonth: 0,
        duration: 5,
        stage: "در حال توسعه",
        health: "ON_TRACK",
        target: "مهر ۱۴۰۵",
        metric: "پشتیبانی کامل از حداقل ۲ کلاس دارایی",
        dependencies: ["GoldAb", "ته‌حساب"],
        blockers: [],
        epics: [
          {
            id: "traz-assets",
            title: "Multi-Asset Core",
            stories: [
              {
                id: "coin-prod",
                title: "تراز سکه",
                tasks: [
                  { id: "coin-model", title: "مدل داده سکه", status: "DONE", owner: "Backend", updatedAt: "ماه قبل" },
                  { id: "coin-prod-release", title: "انتشار تراز سکه", status: "DONE", owner: "Backend", updatedAt: "هفته قبل" },
                  { id: "traz-audit", title: "Audit Log تغییرات", status: "IN_PROGRESS", owner: "Backend", updatedAt: "امروز", nextPeriod: true }
                ]
              }
            ]
          }
        ]
      },
      {
        id: "traz-history-integrations",
        title: "تاریخچه و اتصال‌های عملیاتی",
        summary: "تاریخچه قیمت، ته‌حساب، GoldAb و حذف جریان‌های دستی",
        goal: "ردیابی کامل تغییرات و کاهش زمان عملیات",
        owner: "Pricing Product",
        team: "Backend · Operations · Data",
        startMonth: 3,
        duration: 6,
        stage: "در حال توسعه",
        health: "AT_RISK",
        target: "بهمن ۱۴۰۵",
        metric: "کاهش وابستگی Excel به کمتر از ۱۰٪",
        dependencies: ["ته‌حساب", "GoldAb API"],
        blockers: ["نهایی‌شدن قرارداد داده با یکی از منابع"],
        epics: [
          {
            id: "traz-history",
            title: "History & Integrations",
            stories: [
              {
                id: "traz-connectors",
                title: "اتصال مصرف‌کننده‌ها",
                tasks: [
                  { id: "traz-history-api", title: "API تاریخچه تراز", status: "IN_QA", owner: "Backend", updatedAt: "امروز" },
                  { id: "traz-tahesab", title: "اتصال ته‌حساب", status: "IN_PROGRESS", owner: "Backend", updatedAt: "امروز", nextPeriod: true },
                  { id: "traz-goldab", title: "اتصال GoldAb", status: "IN_PROGRESS", owner: "Backend", updatedAt: "امروز" },
                  { id: "traz-excel", title: "خروج کامل از Excel", status: "TODO", owner: "Operations", updatedAt: "—" }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "pricing-watchtower",
    name: "پرایسر و دیده‌بان",
    shortName: "Pricer / Watchtower",
    description: "جمع‌آوری، ارزیابی، قیمت‌گذاری و کنترل سلامت منابع",
    color: "#A78BFA",
    objective: "تولید قیمت قابل اعتماد و امکان مداخله سریع عملیات",
    metrics: [
      { label: "سلامت منابع", value: "94٪", target: "99٪", trend: "+2.1٪" },
      { label: "منابع فعال", value: "7", target: "10", trend: "+2" },
      { label: "زمان تشخیص خطا", value: "2.4m", target: "<1m", trend: "-31٪" }
    ],
    projects: [
      {
        id: "pricer-core",
        title: "Pricer Core",
        summary: "جمع‌آوری API/Crawling، قواعد سفارشی و انتشار خودکار",
        goal: "تولید قیمت پایدار و قابل نسخه‌بندی برای همه مصرف‌کننده‌ها",
        owner: "Pricing Backend",
        team: "Backend · Data",
        startMonth: 0,
        duration: 6,
        stage: "در حال توسعه",
        health: "ON_TRACK",
        target: "آبان ۱۴۰۵",
        metric: "موفقیت انتشار قیمت بیشتر از ۹۹.۹٪",
        dependencies: ["منابع بیرونی قیمت"],
        blockers: [],
        epics: [
          {
            id: "pricer-pipeline",
            title: "Price Pipeline",
            stories: [
              {
                id: "pricer-ingestion",
                title: "Ingestion و انتشار",
                tasks: [
                  { id: "pricer-api", title: "دریافت قیمت APIها", status: "DONE", owner: "Backend", updatedAt: "ماه قبل" },
                  { id: "pricer-crawl", title: "Crawling منابع فاقد API", status: "IN_PROGRESS", owner: "Backend", updatedAt: "امروز" },
                  { id: "pricer-rules", title: "Versioning قواعد قیمت", status: "TODO", owner: "Backend", updatedAt: "—", nextPeriod: true },
                  { id: "pricer-publish", title: "انتشار خودکار به GoldAb", status: "IN_QA", owner: "Backend", updatedAt: "امروز" }
                ]
              }
            ]
          }
        ]
      },
      {
        id: "watchtower-mvp",
        title: "Watchtower MVP",
        summary: "نمای منابع، Health Tag، وزن، Freeze و Refresh",
        goal: "تشخیص و کنترل سریع منبع قیمت ناسالم توسط عملیات",
        owner: "Pricing Product",
        team: "Product · Design · Frontend · Backend",
        startMonth: 2,
        duration: 5,
        stage: "QA",
        health: "AT_RISK",
        target: "مهر ۱۴۰۵",
        metric: "تشخیص منبع ناسالم در کمتر از ۶۰ ثانیه",
        dependencies: ["Pricer health API", "تیم عملیات"],
        blockers: ["اعتبارسنجی نهایی داده‌ها با عملیات"],
        epics: [
          {
            id: "watchtower-console",
            title: "Operations Console",
            stories: [
              {
                id: "watchtower-sources",
                title: "مشاهده و کنترل منابع",
                tasks: [
                  { id: "watchtower-stage", title: "انتشار روی Stage", status: "DONE", owner: "Frontend", updatedAt: "این هفته" },
                  { id: "watchtower-health", title: "Health Tag کنار منبع", status: "IN_QA", owner: "Frontend", updatedAt: "امروز" },
                  { id: "watchtower-action", title: "Weight / Freeze / Refresh", status: "IN_PROGRESS", owner: "Backend", updatedAt: "امروز", nextPeriod: true },
                  { id: "watchtower-feedback", title: "ارائه و دریافت Feedback عملیات", status: "TODO", owner: "Product", updatedAt: "—", nextPeriod: true }
                ]
              }
            ]
          }
        ]
      },
      {
        id: "watchtower-alerts",
        title: "Alerting و Automation",
        summary: "هشدار اختلاف، قطعی، Stale Price و Lead/Lag",
        goal: "کاهش زمان واکنش و جلوگیری از انتشار قیمت ناسالم",
        owner: "Pricing Platform",
        team: "Backend · SRE · Operations",
        startMonth: 6,
        duration: 6,
        stage: "برنامه‌ریزی",
        health: "ON_TRACK",
        target: "اردیبهشت ۱۴۰۶",
        metric: "MTTR کمتر از ۵ دقیقه",
        dependencies: ["Watchtower MVP"],
        blockers: [],
        epics: [
          {
            id: "alert-engine",
            title: "Alert Engine",
            stories: [
              {
                id: "alert-rules",
                title: "قواعد سلامت منبع",
                tasks: [
                  { id: "alert-prd", title: "تعریف قواعد و Threshold", status: "TODO", owner: "Product", updatedAt: "—" },
                  { id: "alert-channel", title: "انتخاب کانال Alert عملیات", status: "TODO", owner: "Operations", updatedAt: "—" }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "partner-api",
    name: "API همکاران",
    shortName: "B2B API",
    description: "API معامله، تسویه و زیرساخت اتصال همکاران",
    color: "#FF9F68",
    objective: "اتصال سریع و پایدار همکاران با SLA شفاف و عملیات مقیاس‌پذیر",
    metrics: [
      { label: "همکار Production", value: "1", target: "5", trend: "+1" },
      { label: "API Success", value: "98.7٪", target: "99.9٪", trend: "+0.6٪" },
      { label: "زمان Onboarding", value: "14d", target: "<7d", trend: "-3d" }
    ],
    projects: [
      {
        id: "partner-api-v2",
        title: "Partner API V2",
        summary: "API استاندارد، Sandbox، مستندات و اتصال اولین همکار",
        goal: "کاهش زمان و ریسک اتصال همکار جدید",
        owner: "B2B Product",
        team: "Backend · QA · Legal",
        startMonth: 0,
        duration: 6,
        stage: "QA",
        health: "AT_RISK",
        target: "آبان ۱۴۰۵",
        metric: "اولین معامله Production موفق",
        dependencies: ["Ledger V2", "حقوقی"],
        blockers: ["نهایی‌شدن قرارداد همکاری"],
        epics: [
          {
            id: "api-readiness",
            title: "API Readiness",
            stories: [
              {
                id: "api-go-live",
                title: "آماده‌سازی Go-Live",
                tasks: [
                  { id: "api-qa", title: "QA کامل API", status: "DONE", owner: "QA", updatedAt: "این هفته" },
                  { id: "api-sandbox", title: "فعال‌سازی Sandbox", status: "DONE", owner: "Backend", updatedAt: "این هفته" },
                  { id: "api-load", title: "Load Test", status: "IN_PROGRESS", owner: "Backend", updatedAt: "امروز", nextPeriod: true },
                  { id: "api-legal", title: "نهایی‌سازی قرارداد حقوقی", status: "BLOCKED", owner: "Legal", updatedAt: "امروز" },
                  { id: "api-doc", title: "مستندات نهایی Integration", status: "IN_QA", owner: "Product", updatedAt: "امروز", addedThisPeriod: true }
                ]
              }
            ]
          }
        ]
      },
      {
        id: "ledger-v2",
        title: "Ledger V2 Migration",
        summary: "زیرساخت مشترک طلاین، B2B V1 و B2B V2",
        goal: "یکپارچگی مالی، Reconciliation و کاهش وابستگی به سامانه",
        owner: "Trade Platform",
        team: "Backend · Data · System",
        startMonth: 0,
        duration: 8,
        stage: "در حال توسعه",
        health: "OFF_TRACK",
        target: "دی ۱۴۰۵",
        metric: "مغایرت مانده برابر صفر در Parallel Run",
        dependencies: ["تیم سامانه", "مهاجرت دیتابیس"],
        blockers: ["نهایی‌شدن Mapping داده‌های تاریخی", "ظرفیت محدود تیم سامانه"],
        epics: [
          {
            id: "ledger-migration",
            title: "Migration & Reconciliation",
            stories: [
              {
                id: "ledger-data",
                title: "انتقال دیتابیس",
                tasks: [
                  { id: "ledger-requirements", title: "نیازمندی و Accounting Rules", status: "DONE", owner: "Product", updatedAt: "ماه قبل" },
                  { id: "ledger-schema", title: "زیرساخت مشترک Ledger", status: "IN_PROGRESS", owner: "Backend", updatedAt: "امروز" },
                  { id: "ledger-history", title: "مهاجرت داده تاریخی", status: "IN_PROGRESS", owner: "Data", updatedAt: "امروز", nextPeriod: true },
                  { id: "ledger-reconcile", title: "Reconciliation و Parallel Run", status: "TODO", owner: "Backend", updatedAt: "—" },
                  { id: "ledger-rollback", title: "Cutover و Rollback Plan", status: "TODO", owner: "Platform", updatedAt: "—", addedThisPeriod: true }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "partner-software",
    name: "نرم‌افزار همکاران",
    shortName: "Partner Console",
    description: "پنل عملیاتی، مدیریت دسترسی، تراکنش و تسویه همکار",
    color: "#F472B6",
    objective: "Self-service کردن عملیات همکار و کاهش بار پشتیبانی داخلی",
    metrics: [
      { label: "عملیات Self-service", value: "35٪", target: "80٪", trend: "+10٪" },
      { label: "تیکت اتصال", value: "12/w", target: "<4/w", trend: "-18٪" },
      { label: "زمان تسویه", value: "T+1", target: "Same day", trend: "—" }
    ],
    projects: [
      {
        id: "partner-admin",
        title: "پنل ادمین همکاران",
        summary: "مدیریت همکار، دسترسی، تراکنش و وضعیت سرویس",
        goal: "دادن دید و کنترل یکپارچه به تیم عملیات",
        owner: "B2B Product",
        team: "Product · Frontend · Backend · Operations",
        startMonth: 2,
        duration: 6,
        stage: "در حال توسعه",
        health: "ON_TRACK",
        target: "دی ۱۴۰۵",
        metric: "انجام ۸۰٪ عملیات بدون دخالت فنی",
        dependencies: ["Partner API V2"],
        blockers: [],
        epics: [
          {
            id: "partner-console",
            title: "Operations Console",
            stories: [
              {
                id: "partner-management",
                title: "مدیریت همکار",
                tasks: [
                  { id: "partner-admin-v1", title: "ارائه نسخه اولیه به عملیات", status: "DONE", owner: "Product", updatedAt: "این هفته" },
                  { id: "partner-keys", title: "مدیریت API Key و دسترسی", status: "IN_PROGRESS", owner: "Backend", updatedAt: "امروز" },
                  { id: "partner-transactions", title: "مشاهده تراکنش و خطا", status: "IN_QA", owner: "Frontend", updatedAt: "امروز" },
                  { id: "partner-audit", title: "Audit Log عملیات", status: "TODO", owner: "Backend", updatedAt: "—", nextPeriod: true }
                ]
              }
            ]
          }
        ]
      },
      {
        id: "partner-onboarding",
        title: "Onboarding و Sandbox Console",
        summary: "فرایند قرارداد، Credential، تست و Production readiness",
        goal: "کاهش زمان اتصال همکار به کمتر از یک هفته",
        owner: "B2B Product",
        team: "Product · Legal · Operations",
        startMonth: 4,
        duration: 6,
        stage: "برنامه‌ریزی",
        health: "AT_RISK",
        target: "اسفند ۱۴۰۵",
        metric: "Onboarding کمتر از ۷ روز",
        dependencies: ["حقوقی", "Sandbox API"],
        blockers: ["تعریف SLA و مالک فرایند پشتیبانی"],
        epics: [
          {
            id: "onboarding-flow",
            title: "Partner Onboarding",
            stories: [
              {
                id: "partner-activation",
                title: "فعال‌سازی همکار",
                tasks: [
                  { id: "onboarding-flow-design", title: "طراحی Workflow فعال‌سازی", status: "IN_PROGRESS", owner: "Product", updatedAt: "امروز" },
                  { id: "onboarding-legal", title: "وضعیت قرارداد در پنل", status: "TODO", owner: "Frontend", updatedAt: "—" },
                  { id: "onboarding-credential", title: "صدور Sandbox/Prod Credential", status: "TODO", owner: "Backend", updatedAt: "—", nextPeriod: true }
                ]
              }
            ]
          }
        ]
      },
      {
        id: "partner-settlement",
        title: "تسویه و گزارش همکار",
        summary: "مانده، کارمزد، صورتحساب و Reconciliation سلف‌سرویس",
        goal: "شفافیت مالی و کاهش مغایرت‌های پشتیبانی",
        owner: "B2B Product",
        team: "Backend · Finance · Frontend",
        startMonth: 7,
        duration: 7,
        stage: "برنامه‌ریزی",
        health: "ON_TRACK",
        target: "تیر ۱۴۰۶",
        metric: "کاهش ۷۰٪ تیکت‌های مالی همکار",
        dependencies: ["Ledger V2"],
        blockers: [],
        epics: [
          {
            id: "settlement-report",
            title: "Settlement Reporting",
            stories: [
              {
                id: "settlement-view",
                title: "صورتحساب و مانده",
                tasks: [
                  { id: "settlement-prd", title: "PRD گزارش تسویه", status: "TODO", owner: "Product", updatedAt: "—" },
                  { id: "settlement-model", title: "مدل داده صورتحساب", status: "TODO", owner: "Backend", updatedAt: "—" }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

export const velocityHistory = [
  { label: "۵ هفته قبل", done: 8, added: 5 },
  { label: "۴ هفته قبل", done: 11, added: 8 },
  { label: "۳ هفته قبل", done: 9, added: 12 },
  { label: "۲ هفته قبل", done: 14, added: 7 },
  { label: "هفته قبل", done: 16, added: 9 },
  { label: "این هفته", done: 12, added: 6 }
];

export function projectTasks(project: DemoProject) {
  return project.epics.flatMap((epic) => epic.stories.flatMap((story) => story.tasks));
}

export function productTasks(product: DemoProduct) {
  return product.projects.flatMap(projectTasks);
}

export function completion(tasks: DemoTask[]) {
  const scoped = tasks.filter((task) => task.status !== undefined);
  if (!scoped.length) return 0;
  return Math.round((scoped.filter((task) => task.status === "DONE").length / scoped.length) * 100);
}

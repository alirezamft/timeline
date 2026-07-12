import { PrismaClient, Role, Status } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const workspaceSeeds = [
  { name: "دامین ترید", slug: "trade" },
  { name: "دامین ریسک", slug: "risk" },
  { name: "دامین پلتفرم", slug: "platform" },
  { name: "دامین محصول", slug: "product" }
];

const phaseSeeds = [
  {
    label: "فصل اول",
    subtitle: "خرداد تا مرداد ۱۴۰۵",
    goal: "پایدارسازی زیرساخت، تکمیل جریان‌های حیاتی و آماده‌سازی داده‌های تصمیم‌گیری",
    color: "#C9A84C",
    order: 1
  },
  {
    label: "فصل دوم",
    subtitle: "شهریور تا آبان ۱۴۰۵",
    goal: "گسترش قابلیت‌های ترید، کاهش اصطکاک عملیات و افزایش کیفیت تجربه کاربر",
    color: "#55C7FF",
    order: 2
  },
  {
    label: "فصل سوم",
    subtitle: "آذر تا بهمن ۱۴۰۵",
    goal: "اتوماسیون فرآیندها، افزایش مقیاس‌پذیری و تکمیل ابزارهای سازمانی",
    color: "#7CE38B",
    order: 3
  },
  {
    label: "فصل چهارم",
    subtitle: "اسفند ۱۴۰۵ تا اردیبهشت ۱۴۰۶",
    goal: "بهینه‌سازی، آماده‌سازی رشد و تحویل قابلیت‌های پیشرفته به تیم‌ها",
    color: "#F472B6",
    order: 4
  }
];

const domainSeeds = [
  { name: "بازار پیشرفته", color: "#55C7FF", order: 1 },
  { name: "OTC", color: "#7CE38B", order: 2 },
  { name: "B2B همکاران", color: "#F59E0B", order: 3 },
  { name: "زیرساخت", color: "#F472B6", order: 4 }
];

const projectSeeds = [
  ["بازار پیشرفته", "فصل اول", "بازطراحی تجربه سفارش‌گذاری", Status.ACTIVE, 72, 2, "Trading", "تمرکز روی کاهش خطا و سرعت ثبت سفارش"],
  ["بازار پیشرفته", "فصل اول", "عمق بازار پیشرفته", Status.DONE, 100, 1, "Market Data", "نمایش چندسطحی سفارش‌ها برای تیم ترید"],
  ["بازار پیشرفته", "فصل اول", "هشدار نوسان قیمت", Status.REVIEW, 83, 1, "Alert", "هشدارهای لحظه‌ای برای نمادهای حساس"],
  ["بازار پیشرفته", "فصل اول", "بهبود موتور محاسبه کارمزد", Status.DONE, 100, 1, "Fee", "همسان‌سازی محاسبه کارمزد در تمام کانال‌ها"],
  ["بازار پیشرفته", "فصل دوم", "سفارش شرطی مرحله اول", Status.ACTIVE, 55, 2, "Order", "پیاده‌سازی stop و limit برای کاربران منتخب"],
  ["بازار پیشرفته", "فصل دوم", "داشبورد عملکرد معامله‌گر", Status.PLANNED, 22, 2, "Analytics", "گزارش PnL، حجم و نرخ موفقیت سفارش‌ها"],
  ["بازار پیشرفته", "فصل دوم", "بهینه‌سازی latency سفارش", Status.ACTIVE, 61, 1, "Performance", "کاهش زمان round-trip در مسیر سفارش"],
  ["بازار پیشرفته", "فصل سوم", "معاملات الگوریتمی MVP", Status.SOON, 10, 2, "Algo", "اجرای کنترل‌شده strategyهای ساده"],
  ["بازار پیشرفته", "فصل سوم", "API عمومی market watch", Status.PLANNED, 18, 1, "API", "خروجی استاندارد برای مصرف تیم‌های داخلی"],
  ["بازار پیشرفته", "فصل چهارم", "ابزار مقایسه نمادها", Status.SOON, 5, 1, "UX", "مقایسه سریع روند، حجم و اسپرد"],
  ["OTC", "فصل اول", "فرآیند نرخ‌گیری سریع", Status.DONE, 100, 1, "Quote", "کاهش زمان پاسخ اپراتور به درخواست مشتری"],
  ["OTC", "فصل اول", "ثبت خودکار توافق معامله", Status.ACTIVE, 76, 1, "Workflow", "ساخت audit trail برای توافق‌های تلفنی"],
  ["OTC", "فصل اول", "کنترل سقف معامله روزانه", Status.REVIEW, 88, 1, "Risk", "کنترل محدودیت‌های روزانه قبل از تایید"],
  ["OTC", "فصل دوم", "میز کار اپراتور OTC", Status.ACTIVE, 48, 2, "Console", "یکپارچه‌سازی درخواست‌ها، نرخ‌ها و تاییدها"],
  ["OTC", "فصل دوم", "اعلان وضعیت تسویه", Status.PLANNED, 30, 1, "Notification", "اطلاع‌رسانی مرحله‌های تسویه به تیم عملیات"],
  ["OTC", "فصل سوم", "اتوماسیون پیشنهاد نرخ", Status.SOON, 12, 2, "Automation", "پیشنهاد نرخ بر اساس موجودی و بازار"],
  ["OTC", "فصل سوم", "گزارش اختلاف نرخ", Status.PLANNED, 25, 1, "Report", "تحلیل نرخ پیشنهادی، نرخ نهایی و benchmark"],
  ["OTC", "فصل چهارم", "پروفایل مشتریان OTC", Status.SOON, 8, 1, "CRM", "نمایش history و ترجیحات مشتری"],
  ["B2B همکاران", "فصل اول", "پنل onboarding همکار", Status.DONE, 100, 1, "Partner", "ثبت اطلاعات، قرارداد و دسترسی‌های اولیه"],
  ["B2B همکاران", "فصل اول", "کلید API برای همکاران", Status.ACTIVE, 69, 1, "API", "مدیریت کلید، سطح دسترسی و revoke"],
  ["B2B همکاران", "فصل دوم", "گزارش تسویه همکار", Status.ACTIVE, 52, 2, "Settlement", "شفاف‌سازی مانده، تراکنش و کارمزد"],
  ["B2B همکاران", "فصل دوم", "وبهوک وضعیت سفارش", Status.PLANNED, 34, 1, "Webhook", "ارسال رویدادهای استاندارد به سیستم همکار"],
  ["B2B همکاران", "فصل دوم", "مدیریت SLA همکاران", Status.REVIEW, 80, 1, "SLA", "تعریف سطح سرویس و پایش تخلف‌ها"],
  ["B2B همکاران", "فصل سوم", "داشبورد سلامت اتصال", Status.SOON, 15, 1, "Monitoring", "پایش خطاها و latency برای هر همکار"],
  ["B2B همکاران", "فصل سوم", "محیط sandbox همکار", Status.PLANNED, 20, 2, "Sandbox", "تست سفارش و تسویه بدون اثر روی محیط اصلی"],
  ["B2B همکاران", "فصل چهارم", "مدل کارمزدی شناور", Status.SOON, 5, 1, "Commercial", "تعریف ruleهای کارمزد بر اساس حجم و قرارداد"],
  ["زیرساخت", "فصل اول", "استانداردسازی observability", Status.ACTIVE, 74, 2, "SRE", "لاگ، metric و trace مشترک برای سرویس‌های حیاتی"],
  ["زیرساخت", "فصل اول", "پایپ‌لاین migration امن", Status.DONE, 100, 1, "Database", "کنترل rollout و rollback تغییرات دیتابیس"],
  ["زیرساخت", "فصل اول", "سخت‌سازی دسترسی ادمین", Status.REVIEW, 90, 1, "Security", "بازبینی session، role و audit"],
  ["زیرساخت", "فصل دوم", "صف پردازش سفارش‌های سنگین", Status.ACTIVE, 57, 2, "Queue", "جداسازی jobهای سنگین از مسیر real-time"],
  ["زیرساخت", "فصل دوم", "کش داده‌های بازار", Status.PLANNED, 28, 1, "Cache", "کاهش فشار روی سرویس market data"],
  ["زیرساخت", "فصل سوم", "آماده‌سازی multi-region", Status.SOON, 9, 2, "Scale", "طراحی active-passive و مانور disaster recovery"],
  ["زیرساخت", "فصل سوم", "آرشیو رویدادهای عملیاتی", Status.PLANNED, 26, 1, "Audit", "ذخیره امن رویدادها برای گزارش و بررسی"],
  ["زیرساخت", "فصل چهارم", "بهینه‌سازی هزینه زیرساخت", Status.SOON, 6, 1, "FinOps", "شناسایی منابع کم‌استفاده و ruleهای autoscale"],
  ["زیرساخت", "فصل چهارم", "مرکز کنترل release", Status.PLANNED, 14, 1, "Release", "نمای واحد انتشار، وضعیت سرویس و تایید نهایی"]
] as const;

const requiredEnv = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required seed environment variable: ${name}`);
  return value;
};

const credentialSeeds = [
  ["مدیر کل", "superadmin", "INITIAL_SUPERADMIN_PASSWORD", Role.SUPER_ADMIN, null],
  ["ادمین تیم ترید", "trade.admin", "INITIAL_TRADE_ADMIN_PASSWORD", Role.WORKSPACE_ADMIN, "trade"],
  ["مشاهده‌گر ترید", "trade.viewer", "INITIAL_TRADE_VIEWER_PASSWORD", Role.VIEWER, "trade"],
  ["ادمین تیم ریسک", "risk.admin", "INITIAL_RISK_ADMIN_PASSWORD", Role.WORKSPACE_ADMIN, "risk"],
  ["مشاهده‌گر ریسک", "risk.viewer", "INITIAL_RISK_VIEWER_PASSWORD", Role.VIEWER, "risk"],
  ["ادمین تیم پلتفرم", "platform.admin", "INITIAL_PLATFORM_ADMIN_PASSWORD", Role.WORKSPACE_ADMIN, "platform"],
  ["مشاهده‌گر پلتفرم", "platform.viewer", "INITIAL_PLATFORM_VIEWER_PASSWORD", Role.VIEWER, "platform"],
  ["ادمین تیم محصول", "product.admin", "INITIAL_PRODUCT_ADMIN_PASSWORD", Role.WORKSPACE_ADMIN, "product"],
  ["مشاهده‌گر محصول", "product.viewer", "INITIAL_PRODUCT_VIEWER_PASSWORD", Role.VIEWER, "product"],
  ["مهمان فقط‌مشاهده کل", "guest.viewer", "INITIAL_GUEST_VIEWER_PASSWORD", Role.VIEWER, "trade"]
] as const;

async function main() {
  const workspaces = new Map<string, { id: string; name: string; slug: string }>();

  for (const workspaceSeed of workspaceSeeds) {
    const workspace = await prisma.workspace.upsert({
      where: { slug: workspaceSeed.slug },
      create: workspaceSeed,
      update: { name: workspaceSeed.name }
    });
    workspaces.set(workspace.slug, workspace);
  }

  const trade = workspaces.get("trade");
  if (!trade) throw new Error("Trade workspace was not created.");

  const phases = new Map<string, { id: string }>();
  for (const phaseSeed of phaseSeeds) {
    const existing = await prisma.phase.findFirst({
      where: { workspaceId: trade.id, label: phaseSeed.label }
    });
    const phase = existing
      ? await prisma.phase.update({ where: { id: existing.id }, data: phaseSeed })
      : await prisma.phase.create({ data: { ...phaseSeed, workspaceId: trade.id } });
    phases.set(phase.label, phase);
  }

  const domains = new Map<string, { id: string }>();
  for (const domainSeed of domainSeeds) {
    const existing = await prisma.domain.findFirst({
      where: { workspaceId: trade.id, name: domainSeed.name }
    });
    const domain = existing
      ? await prisma.domain.update({ where: { id: existing.id }, data: domainSeed })
      : await prisma.domain.create({ data: { ...domainSeed, workspaceId: trade.id } });
    domains.set(domain.name, domain);
  }

  const superPasswordHash = await hash(requiredEnv("INITIAL_SUPERADMIN_PASSWORD"), 12);
  const superAdmin = await prisma.user.upsert({
    where: { username: "superadmin" },
    create: {
      username: "superadmin",
      fullName: "مدیر کل",
      role: Role.SUPER_ADMIN,
      workspaceId: null,
      passwordHash: superPasswordHash,
      mustChangePassword: true
    },
    update: {
      fullName: "مدیر کل",
      role: Role.SUPER_ADMIN,
      workspaceId: null
    }
  });

  for (const projectSeed of projectSeeds) {
    const [domainName, phaseLabel, name, status, progress, span, tag, note] = projectSeed;
    const domain = domains.get(domainName);
    const phase = phases.get(phaseLabel);
    if (!domain || !phase) throw new Error(`Missing relation for project ${name}`);

    const existing = await prisma.project.findFirst({
      where: { workspaceId: trade.id, name }
    });

    const data = {
      workspaceId: trade.id,
      domainId: domain.id,
      startPhaseId: phase.id,
      name,
      status,
      progress,
      span,
      tag,
      note,
      createdById: superAdmin.id
    };

    if (existing) {
      await prisma.project.update({ where: { id: existing.id }, data });
    } else {
      await prisma.project.create({ data });
    }
  }

  for (const [fullName, username, passwordEnv, role, workspaceSlug] of credentialSeeds) {
    const workspaceId = workspaceSlug ? workspaces.get(workspaceSlug)?.id : null;
    await prisma.user.upsert({
      where: { username },
      create: {
        fullName,
        username,
        role,
        workspaceId,
        passwordHash: await hash(requiredEnv(passwordEnv), 12),
        mustChangePassword: true
      },
      update: {
        fullName,
        role,
        workspaceId: role === Role.SUPER_ADMIN ? null : workspaceId
      }
    });
  }

  console.log("Seed completed: workspaces, phases, domains, projects, and users are ready.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

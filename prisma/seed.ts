import { DeliveryHealth, PrismaClient, Role, ScopeState, Status, WorkItemType, WorkflowStatus } from "@prisma/client";
import { hash } from "bcryptjs";
import { tradeProducts, type DemoProject, type DemoTask } from "../lib/trade-portfolio-demo";

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
  },
  {
    label: "فصل پنجم",
    subtitle: "خرداد تا مرداد ۱۴۰۶",
    goal: "تحویل موج دوم قابلیت‌های Trade و افزایش مقیاس‌پذیری",
    color: "#7CE38B",
    order: 5
  },
  {
    label: "فصل ششم",
    subtitle: "شهریور تا آبان ۱۴۰۶",
    goal: "تثبیت نهایی، گزارش‌دهی مدیریتی و آماده‌سازی رشد بعدی",
    color: "#A78BFA",
    order: 6
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

function metricNumber(value: string) {
  const normalized = value.replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)));
  const match = normalized.match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function monthStart(monthIndex: number) {
  return new Date(Date.UTC(2026, 5 + monthIndex, 1));
}

function initiativeStatus(project: DemoProject): WorkflowStatus {
  const tasks = project.epics.flatMap((epic) => epic.stories.flatMap((story) => story.tasks));
  if (tasks.length && tasks.every((task) => task.status === "DONE")) return WorkflowStatus.DONE;
  if (tasks.some((task) => task.status === "BLOCKED")) return WorkflowStatus.BLOCKED;
  if (tasks.some((task) => task.status === "IN_QA")) return WorkflowStatus.IN_QA;
  if (tasks.some((task) => task.status === "IN_PROGRESS")) return WorkflowStatus.IN_PROGRESS;
  return WorkflowStatus.BACKLOG;
}

function workItemStatus(task: DemoTask): WorkflowStatus {
  if (task.status === "DONE") return WorkflowStatus.DONE;
  if (task.status === "BLOCKED") return WorkflowStatus.BLOCKED;
  if (task.status === "IN_QA") return WorkflowStatus.IN_QA;
  if (task.status === "IN_PROGRESS") return WorkflowStatus.IN_PROGRESS;
  return WorkflowStatus.BACKLOG;
}

async function upsertDemoWorkItem(
  workspaceId: string,
  productId: string,
  initiativeId: string,
  parentId: string | null,
  id: string,
  type: WorkItemType,
  title: string,
  status: WorkflowStatus,
  ownerId: string,
  team: string
) {
  const workItem = await prisma.workItem.upsert({
    where: { id },
    update: { productId, initiativeId, parentId, type, title, status, ownerId, team, completedAt: status === WorkflowStatus.DONE ? new Date() : null },
    create: {
      id,
      workspaceId,
      productId,
      initiativeId,
      parentId,
      type,
      title,
      status,
      health: DeliveryHealth.ON_TRACK,
      scopeState: ScopeState.COMMITTED,
      ownerId,
      team,
      storyPoints: type === WorkItemType.TASK || type === WorkItemType.BUG || type === WorkItemType.SUBTASK ? 1 : null,
      completedAt: status === WorkflowStatus.DONE ? new Date() : null
    }
  });

  const existingHistory = await prisma.statusHistory.findFirst({ where: { workItemId: workItem.id, toStatus: status } });
  if (!existingHistory) {
    await prisma.statusHistory.create({
      data: { workspaceId, workItemId: workItem.id, toStatus: status, changedById: ownerId }
    });
  }
  return workItem;
}

async function seedTradePortfolio(workspaceId: string, superAdminId: string) {
  const productMap = new Map<string, { id: string }>();

  for (const [order, productSeed] of tradeProducts.entries()) {
    const legacyDomain = await prisma.domain.findFirst({ where: { workspaceId, name: productSeed.name } });
    const product = await prisma.product.upsert({
      where: { workspaceId_name: { workspaceId, name: productSeed.name } },
      update: {
        slug: productSeed.id,
        description: productSeed.description,
        color: productSeed.color,
        order: order + 1,
        isActive: true,
        objective: productSeed.objective,
        ownerId: superAdminId,
        legacyDomainId: legacyDomain?.id ?? undefined
      },
      create: {
        workspaceId,
        legacyDomainId: legacyDomain?.id,
        name: productSeed.name,
        slug: productSeed.id,
        description: productSeed.description,
        color: productSeed.color,
        order: order + 1,
        isActive: true,
        objective: productSeed.objective,
        northStarMetric: productSeed.metrics[0]?.label,
        ownerId: superAdminId
      }
    });
    productMap.set(productSeed.id, product);

    for (const metricSeed of productSeed.metrics) {
      const metric = await prisma.metric.findFirst({ where: { workspaceId, productId: product.id, name: metricSeed.label } });
      const data = {
        workspaceId,
        productId: product.id,
        name: metricSeed.label,
        unit: metricSeed.value.replace(/[۰-۹\d+\-–.\s]/g, "").trim() || null,
        baseline: null,
        target: metricNumber(metricSeed.target),
        actual: metricNumber(metricSeed.value),
        direction: metricSeed.label.includes("زمان") ? "LOWER_IS_BETTER" as const : "HIGHER_IS_BETTER" as const
      };
      if (metric) await prisma.metric.update({ where: { id: metric.id }, data });
      else await prisma.metric.create({ data });
    }
  }

  for (const productSeed of tradeProducts) {
    const product = productMap.get(productSeed.id);
    if (!product) continue;
    for (const project of productSeed.projects) {
      const start = monthStart(project.startMonth);
      const end = monthStart(project.startMonth + project.duration);
      const initiative = await prisma.initiative.upsert({
        where: { legacyProjectId: `demo-${project.id}` },
        update: {
          productId: product.id,
          name: project.title,
          summary: project.summary,
          goal: project.goal,
          ownerId: superAdminId,
          team: project.team,
          plannedStart: start,
          plannedEnd: new Date(end.getTime() - 24 * 60 * 60 * 1000),
          status: initiativeStatus(project),
          health: project.health
        },
        create: {
          workspaceId,
          productId: product.id,
          legacyProjectId: `demo-${project.id}`,
          name: project.title,
          summary: project.summary,
          goal: project.goal,
          ownerId: superAdminId,
          team: project.team,
          plannedStart: start,
          plannedEnd: new Date(end.getTime() - 24 * 60 * 60 * 1000),
          status: initiativeStatus(project),
          health: project.health,
          scopeBaseline: project.epics.reduce((sum, epic) => sum + epic.stories.reduce((storySum, story) => storySum + story.tasks.length, 0), 0),
          jiraUrl: null
        }
      });

      for (const epic of project.epics) {
        const epicItem = await upsertDemoWorkItem(workspaceId, product.id, initiative.id, null, `demo-${project.id}-${epic.id}`, WorkItemType.EPIC, epic.title, WorkflowStatus.IN_PROGRESS, superAdminId, project.team);
        for (const story of epic.stories) {
          const storyItem = await upsertDemoWorkItem(workspaceId, product.id, initiative.id, epicItem.id, `demo-${project.id}-${story.id}`, WorkItemType.STORY, story.title, WorkflowStatus.IN_PROGRESS, superAdminId, project.team);
          for (const task of story.tasks) {
            await upsertDemoWorkItem(workspaceId, product.id, initiative.id, storyItem.id, `demo-${project.id}-${task.id}`, WorkItemType.TASK, task.title, workItemStatus(task), superAdminId, project.team);
          }
        }
      }

      for (const [index, label] of project.dependencies.entries()) {
        await prisma.dependency.upsert({
          where: { id: `demo-dependency-${project.id}-${index}` },
          update: { label, fromInitiativeId: initiative.id },
          create: { id: `demo-dependency-${project.id}-${index}`, workspaceId, fromInitiativeId: initiative.id, label, kind: "BLOCKS" }
        });
      }
      for (const [index, title] of project.blockers.entries()) {
        await prisma.blocker.upsert({
          where: { id: `demo-blocker-${project.id}-${index}` },
          update: { title, initiativeId: initiative.id, status: "OPEN" },
          create: { id: `demo-blocker-${project.id}-${index}`, workspaceId, initiativeId: initiative.id, title, owner: project.owner, severity: "HIGH", status: "OPEN" }
        });
      }
    }
  }
}

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

  await seedTradePortfolio(trade.id, superAdmin.id);

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

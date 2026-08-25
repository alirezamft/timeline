# نقشه محصول و اجرای Trade Portfolio

## 1. تصمیم اصلی

این اپ یک Jira جایگزین نیست. Jira محل ثبت و اجرای کارها باقی می‌ماند و Trade Portfolio لایه‌ی مشاهده، تحلیل و گزارش مدیریتی روی داده‌های Jira است.

هدف این است که هر مخاطب بتواند از یک صفحه واحد، متناسب با سطح نیاز خود پاسخ بگیرد:

- مدیر ارشد: وضعیت کل دامین، Outcomeها، ریسک‌ها و تاریخ‌های کلیدی
- مدیر محصول دامین: وضعیت محصولات، پروژه‌های داخلی، Scope، سرعت و وابستگی‌ها
- مدیر محصول هر محصول: Epic، Story، Task، QA، Blocker و برنامه بعدی
- تیم فنی و QA: کارهای منتسب، وضعیت جاری، وابستگی و Definition of Done
- مالک OKR: Baseline، Target، Actual و میزان Contribution هر پروژه به KR

## 2. بازه زمانی

رودمپ از خرداد ۱۴۰۵ شروع می‌شود و ۱۸ ماه ادامه دارد:

1. خرداد تا مرداد ۱۴۰۵
2. شهریور تا آبان ۱۴۰۵
3. آذر تا بهمن ۱۴۰۵
4. اسفند ۱۴۰۵ تا اردیبهشت ۱۴۰۶
5. خرداد تا مرداد ۱۴۰۶
6. شهریور تا آبان ۱۴۰۶

نمای مدیریتی به‌صورت پیش‌فرض فصل‌ها را نشان می‌دهد و کاربر می‌تواند تا سطح ماه، هفته و Task پایین برود.

## 3. سلسله‌مراتب قطعی

```text
Trade Domain
└── Product
    └── Internal Project / Initiative
        └── Epic
            └── User Story
                └── Task / Bug
                    └── Sub-task
```

محصولات دامین Trade:

1. بازار پیشرفته
2. OTC
3. تراز
4. پرایسر و دیده‌بان
5. API همکاران
6. نرم‌افزار همکاران

Ledger V2 یک محصول جدا نیست و به‌عنوان پروژه زیرساختی Cross-product ثبت می‌شود. در نسخه اولیه، مالک اصلی آن API همکاران است و Contribution آن به محصولات وابسته نیز نمایش داده می‌شود.

## 4. تفاوت مفاهیم

### Product

یک جریان ارزش پایدار با هدف و متریک مستقل؛ مانند بازار پیشرفته یا OTC.

هر Product باید این فیلدها را داشته باشد:

- نام و توضیح
- Product Owner
- هدف کلان
- North-star Metric
- Supporting Metrics
- Baseline، Target و Actual
- وضعیت سلامت
- درصد پیشرفت Delivery
- پروژه‌های داخلی

### Internal Project / Initiative

یک تغییر محدود و قابل تحویل داخل محصول؛ مانند «انتقال بازار پیشرفته به دامین Trade» یا «بازطراحی Matching Engine».

هر Project باید این فیلدها را داشته باشد:

- هدف و مسئله
- مالک
- تیم‌های درگیر
- تاریخ برنامه‌ای شروع و پایان
- تاریخ واقعی شروع و پایان
- وضعیت و Health
- متریک موفقیت
- وابستگی‌ها
- Blockerها
- Scope Baseline
- Epicها
- لینک Jira

### Epic، Story و Task

- Epic: یک بخش بزرگ از Solution یا Capability
- User Story: یک نیاز قابل تحویل برای یک Actor مشخص
- Task: کار اجرایی قابل انجام توسط یک نفر یا تیم
- Bug: نقصی که باید وارد چرخه توسعه و QA شود
- Sub-task: کوچک‌ترین واحد اجرایی و مبنای Roll-up پیشرفت

## 5. اصل محاسبه پیشرفت

درصد پیشرفت نباید دستی وارد شود.

### نسخه دمو و MVP

```text
Project Progress = Done Leaf Tasks / All In-scope Leaf Tasks
Product Progress = Done Leaf Tasks of Product / All In-scope Leaf Tasks of Product
Domain Progress = Done Leaf Tasks of Domain / All In-scope Leaf Tasks of Domain
```

قواعد:

- فقط Task و Sub-taskهای انتهایی در محاسبه شرکت می‌کنند.
- Canceled و Out of Scope از صورت و مخرج حذف می‌شوند.
- اگر Task از Done به Reopened برگردد، پیشرفت والدها کاهش پیدا می‌کند.
- Task جدید مخرج را افزایش می‌دهد و Scope Growth در گزارش ثبت می‌شود.
- Epic یا Story بدون Task، تا زمان Breakdown در پیشرفت صفر محسوب می‌شود.
- Taskهای QA و Release باید جدا باشند؛ Done شدن Development به‌تنهایی به معنی تحویل نیست.

### نسخه بعدی

امکان انتخاب روش وزن‌دهی در سطح Workspace:

- Count-based: هر Leaf Task وزن برابر
- Story Point-based: وزن بر اساس Story Point
- Estimate-based: وزن بر اساس Original Estimate
- Milestone-based: وزن دستی فقط برای Milestoneهای مدیریتی

روش پیش‌فرض پیشنهادی برای دامین Trade: Story Point-based در سطح Story و Count-based برای Sub-taskهای داخل Story.

## 6. Workflow استاندارد

```text
Backlog
→ Ready for Development
→ In Progress
→ Code Review
→ Ready for QA
→ In QA
→ Rework
→ Ready for Release
→ Done
```

وضعیت‌های جانبی:

- Blocked
- Paused
- Canceled
- Out of Scope

قواعد QA:

- Failed QA تسک را وارد Rework می‌کند.
- پس از Rework دوباره وارد Ready for QA می‌شود.
- فقط Done در محاسبه پیشرفت کامل حساب می‌شود.
- تعداد رفت‌وبرگشت QA به‌عنوان Rework Rate ذخیره و گزارش می‌شود.

## 7. Health پروژه

Health از Status جداست:

- On Track: تاریخ و Scope مطابق برنامه
- At Risk: احتمال تأخیر یا عدم تحقق متریک
- Off Track: تاریخ یا هدف قطعی از برنامه خارج شده

Health در MVP توسط Product Owner تعیین می‌شود. در نسخه بعد به‌صورت پیشنهادی محاسبه می‌شود:

- عقب‌ماندگی Plan در برابر Actual
- Blocker قدیمی‌تر از Threshold
- رشد Scope بدون تغییر تاریخ
- افزایش Rework Rate
- کاهش Velocity
- Dependency تأخیردار

## 8. Information Architecture اپ

### صفحه 1 — Domain Overview

اولین View برای مدیران و ارائه:

- پیشرفت کل دامین
- تعداد محصولات و پروژه‌ها
- Taskهای Done، Active و Blocked
- Delivery Confidence
- شش کارت Product
- Progress هر Product
- Product Metrics با Baseline/Target/Actual
- پروژه‌های At Risk و Off Track
- مسیر بحرانی
- تغییر پیشرفت در دوره اخیر

### صفحه 2 — 18-Month Roadmap

- محور زمان ۱۸ماهه
- Group بر اساس Product
- نوار هر Internal Project
- Plan در برابر Actual
- Milestone و Release
- وضعیت Health با رنگ مستقل
- Current Month Marker
- فیلتر Product، Owner، Team، Status، Health و OKR
- جست‌وجو
- کلیک Project برای Drill-down

### صفحه 3 — Product Detail

- هدف و متریک‌های محصول
- درصد Delivery
- Outcome Trend
- پروژه‌های داخلی
- Dependency Map
- ریسک‌ها
- تاریخچه تغییر Scope
- گزارش‌های مرتبط

### صفحه 4 — Project Detail Drawer/Page

- Goal، Owner، Team و Target Date
- Progress و Plan vs Actual
- Metric موفقیت
- Blocker و Dependency
- Epic → Story → Task
- وضعیت QA و تعداد Rework
- Activity History
- لینک مستقیم به Jira

### صفحه 5 — Reports

سه بازه Daily، Weekly و Monthly:

- چه کارهایی Done شد؟
- Progress از چند به چند رسید؟
- چه Scopeای اضافه یا حذف شد؟
- چه پروژه‌ای تغییر Health داشت؟
- چه Blockerهایی ایجاد یا رفع شدند؟
- برنامه دوره بعد چیست؟
- Velocity و Scope Growth
- Rework Rate و QA Aging
- Planned vs Actual
- خروجی Copy/Export برای گزارش مدیریتی

### صفحه 6 — Team Execution

- کارهای هر فرد یا تیم
- Aging هر Status
- QA Queue
- Blocked Queue
- Workload
- Deadlineهای نزدیک

این صفحه بعد از تثبیت Portfolio View ساخته می‌شود.

## 9. معماری داده پیشنهادی

مدل فعلی `Domain → Project` برای نیاز جدید کافی نیست. مدل مقصد:

```text
Workspace
Product
Initiative
WorkItem
Metric
MetricSnapshot
Dependency
Blocker
StatusHistory
ProgressSnapshot
SyncRun
```

### WorkItem

برای جلوگیری از ایجاد جدول جدا برای Epic، Story و Task، همه در یک جدول Self-relation ذخیره می‌شوند:

```text
id
workspaceId
productId
initiativeId
parentId
type: EPIC | STORY | TASK | SUBTASK | BUG | MILESTONE
title
description
status
health
ownerId
team
startDate
dueDate
completedAt
storyPoints
originalEstimate
jiraIssueKey
jiraIssueId
jiraUrl
createdAt
updatedAt
```

### Snapshotها

برای گزارش تاریخی، نگه‌داشتن وضعیت فعلی کافی نیست. روزانه Snapshot می‌گیریم:

- progress
- totalScope
- doneScope
- activeScope
- blockedScope
- velocity
- reworkCount
- health
- metric actual values

بدون Snapshot نمی‌توان گفت «این هفته چقدر جلو رفتیم؟» یا «چند Task به Scope اضافه شد؟»

## 10. اتصال Jira

### اصل معماری

```text
Jira = Source of Truth for execution
Trade Portfolio = Read model + Analytics + Reporting
```

در V1 اپ نباید Jira را ویرایش کند. Sync یک‌طرفه، امن‌تر و سریع‌تر است.

### Mapping پیشنهادی

| Trade Portfolio | Jira |
|---|---|
| Product | Custom Field: Trade Product |
| Internal Project | Initiative Issue Type یا Custom Field |
| Epic | Epic |
| Story | Story |
| Task | Task |
| Sub-task | Sub-task |
| Health | Custom Field: Delivery Health |
| Target Date | Target Start / Target End |
| OKR | Custom Field: OKR / KR |
| Dependency | Issue Link: blocks / is blocked by |

### فیلدهای لازم در Jira

- Trade Product
- Internal Project / Initiative
- OKR Cycle
- Objective
- Key Result
- Delivery Health
- Target Start
- Target End
- Product Owner
- Team
- Metric Contribution
- Scope State: Committed / Candidate / Out of Scope

### روش Sync

با توجه به Jira Local:

1. سرویس Sync داخل شبکه سازمان اجرا می‌شود.
2. هر ۵ تا ۱۵ دقیقه Jira REST API را می‌خواند.
3. Issueهای تغییرکرده از `updated` Cursor دریافت می‌شوند.
4. داده‌ها Normalize و Upsert می‌شوند.
5. Progress Roll-up محاسبه می‌شود.
6. Change Log و Snapshot ساخته می‌شود.
7. UI با Refresh یا Server Sent Events به‌روز می‌شود.

اگر Webhook داخلی قابل دسترس باشد، Webhook جای Polling را می‌گیرد و Reconciliation زمان‌بندی‌شده به‌عنوان پشتیبان باقی می‌ماند.

## 11. وضعیت کد فعلی

قابلیت‌های قابل استفاده:

- Next.js App Router
- Prisma و PostgreSQL
- احراز هویت داخلی
- نقش‌های Super Admin، Workspace Admin و Viewer
- Workspace مستقل
- CRUD فاز، دامین و پروژه
- رابط RTL و دارک
- Docker Compose و Caddy

شکاف‌های اصلی:

- مدل Product وجود ندارد و Domain فعلی نقش Product را بازی می‌کند.
- فقط چهار فصل وجود دارد؛ به شش فصل نیاز داریم.
- Epic، Story، Task و Sub-task وجود ندارند.
- Progress دستی است.
- تاریخ واقعی Start/End ذخیره نمی‌شود.
- Dependency، Blocker، Metric و OKR مدل نشده‌اند.
- Snapshot و Report Engine وجود ندارد.
- Jira Sync وجود ندارد.
- Drill-down فعلی فقط Modal ویرایش Project است.

## 12. مسیر توسعه

### Milestone 0 — Demo قابل ارائه

- صفحه `/demo`
- شش Product واقعی‌نما
- ۱۸ ماه و شش فصل
- Domain Overview
- Product Metrics
- Timeline پروژه‌های داخلی
- Project Drawer
- Epic/Story/Task
- تغییر Live درصد با تیک Task
- Weekly Report
- Velocity، Scope Added و Blocker

هدف: تأیید مدل ذهنی و تجربه بصری قبل از Migration دیتابیس.

### Milestone 1 — Portfolio Data Model

- Migration مدل Product/Initiative/WorkItem
- CRUD کامل
- Progress Roll-up سمت Server
- Dependency و Blocker
- Metric و OKR
- Seed اولیه دامین Trade

### Milestone 2 — Reporting Engine

- Status History
- Daily Snapshot
- Scope Change
- Velocity
- QA/Rework Analytics
- Daily/Weekly/Monthly Report
- Export Markdown/PDF

### Milestone 3 — Jira Read-only Sync

- تنظیم Jira Connection داخل شبکه
- Field Mapping
- Incremental Sync
- Manual Sync و Sync Health
- Deep Link به Jira
- Reconciliation Job

### Milestone 4 — Production Hardening

- SSO یا اتصال به Identity Provider سازمان
- Audit Log
- Permission در سطح Product
- Backup/Restore
- Monitoring
- Rate limit و Security review
- Production deployment

### Milestone 5 — Write-back اختیاری

فقط پس از موفقیت Read-only Sync:

- تغییر Health و Target Date
- ساخت Initiative یا Epic از اپ
- Comment یا Report link در Jira

## 13. Definition of Done دمو

- در اولین View وضعیت کل دامین در کمتر از ۱۰ ثانیه قابل فهم باشد.
- مدیر بتواند محصول پرریسک را بدون ورود به جزئیات پیدا کند.
- با حداکثر دو کلیک از Domain به Task برسیم.
- تیک Task بلافاصله Progress والدها را تغییر دهد.
- Roadmap تمام ۱۸ ماه را نشان دهد.
- گزارش هفتگی Done، Next، Added Scope و Blocker را بسازد.
- داده دمو تمام شش Product را پوشش دهد.
- UI در Desktop پرزنت‌پذیر و در Mobile قابل استفاده باشد.
- Build، Type check و Test بدون خطا باشد.

## 14. سناریوی ارائه

1. Domain Overview را باز کن و پیشرفت کل، شش محصول و ریسک‌ها را نشان بده.
2. توضیح بده Delivery Progress با Outcome Metric یکی نیست و هر دو کنار هم دیده می‌شوند.
3. وارد Roadmap شو و بازه خرداد ۱۴۰۵ تا آبان ۱۴۰۶ را نشان بده.
4. Product بازار پیشرفته را فیلتر کن.
5. پروژه «انتقال بازار پیشرفته به Trade» را باز کن.
6. از Project وارد Epic، Story و Task شو.
7. یک Task را Done کن و تغییر درصد Project، Product و Domain را نشان بده.
8. وارد Reports شو و Done، Next، Scope Added و Blocker را نمایش بده.
9. توضیح بده در نسخه Production تمام این تغییرات از Jira می‌آیند.

## 15. پرامپت ادامه توسعه برای Codex

```text
Continue the existing Next.js repository as the Trade Portfolio control center described in docs/TRADE_PORTFOLIO_BLUEPRINT.md.

Keep Jira as the execution source of truth and this application as the portfolio read model, analytics, and reporting layer. Preserve the current authentication, workspace isolation, RTL Persian UI, Prisma/PostgreSQL stack, Docker self-hosting, and existing admin capabilities.

Implement work in this order:

1. Treat the approved /demo experience as the UX reference.
2. Add the normalized Product, Initiative, WorkItem, Metric, Dependency, Blocker, StatusHistory, ProgressSnapshot, and SyncRun models with safe Prisma migrations.
3. Migrate the current Domain records to Products and current Project records to Initiatives without losing existing data.
4. Implement server-side progress roll-up from leaf work items. Exclude CANCELED and OUT_OF_SCOPE. Reopened items must reduce roll-up progress.
5. Add authenticated portfolio overview, 18-month timeline, product detail, initiative drawer, and daily/weekly/monthly report routes.
6. Add CRUD and permission checks for all new entities.
7. Add snapshot generation and report comparison logic before Jira integration.
8. Add read-only Jira sync behind a provider interface so the demo and tests can use a fake provider. Never store Jira credentials in source control.
9. Add unit tests for roll-up, scope change, status mapping, and workspace isolation; add Playwright tests for overview → timeline → project → task and reports.
10. Run lint, tests, and production build after each milestone. Do not replace the current architecture or rewrite unrelated authentication/admin code.

UX requirements:
- Persian RTL, desktop-first for executive presentation, responsive on mobile.
- Domain → Product → Initiative → Epic → Story → Task in no more than two drill-down interactions.
- Delivery progress and product outcome metrics must always be visually distinct.
- Health, status, blockers, dependencies, scope changes, and current-month marker must be visible.
- Use the existing dark navy/gold visual identity and product-specific accent colors.
- Keep dense enterprise information readable; avoid decorative landing-page sections.
```

# اپلیکیشن مدیریت رودمپ سازمانی

یک اپلیکیشن full-stack و self-hosted برای مدیریت رودمپ پروژه‌های سازمانی با Next.js، Prisma، PostgreSQL و احراز هویت داخلی.

## امکانات

- رابط فارسی، راست‌به‌چپ، دارک و مناسب استفاده درون‌سازمانی
- Workspaceهای مستقل برای تیم‌ها و دامین‌ها
- نقش‌های `SUPER_ADMIN`، `WORKSPACE_ADMIN` و `VIEWER`
- ورود با نام کاربری/رمز عبور، session داخلی، کوکی `httpOnly` و هش رمز با bcrypt
- تغییر رمز اجباری بعد از اولین ورود
- مدیریت workspaceها و کاربران برای مدیر کل
- رودمپ تعاملی با فاز، دامین، پروژه، وضعیت، progress و فیلتر
- دموی پورتفولیوی Trade با ۶ محصول، رودمپ ۱۸ماهه، Drill-down تا Task و گزارش زنده
- Docker Compose شامل Postgres، اپ Next.js و Caddy با TLS رایگان

## دموی Trade Portfolio

پس از اجرای اپ، نسخه نمایشی بدون نیاز به ورود در مسیر زیر در دسترس است:

```text
http://localhost:3000/demo
```

این View برای تأیید تجربه کاربری و ارائه ساخته شده و داده‌های آن نمونه هستند. نقشه کامل مدل محصول، اتصال Jira و مسیر توسعه در `docs/TRADE_PORTFOLIO_BLUEPRINT.md` قرار دارد.

## اجرای محلی

### گزینه ۱: اجرای بدون Docker برای توسعه

اگر Docker روی سیستم شما فعال نیست، دیتابیس توسعه را با PGlite اجرا کنید. این مسیر فقط برای توسعه محلی است و همچنان در production از PostgreSQL واقعی استفاده می‌شود.

وابستگی‌ها را نصب کنید:

```bash
npm install
```

در یک ترمینال جداگانه دیتابیس محلی را بالا بیاورید:

```bash
npm run dev:db
```

فایل محیطی توسعه را بسازید:

```bash
cp .env.local.example .env.local
```

Prisma و داده‌های اولیه را آماده کنید:

```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

اپلیکیشن را اجرا کنید:

```bash
npm run dev
```

آدرس محلی:

```text
http://localhost:3000
```

### گزینه ۲: اجرای محلی با Docker

ابتدا فایل محیطی Docker را بسازید:

```bash
cp .env.example .env
```

برای اجرای دیتابیس با Docker:

```bash
docker compose up -d postgres
```

وابستگی‌ها را نصب کنید:

```bash
npm install
```

Prisma Client و دیتابیس را آماده کنید:

```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

اپلیکیشن را اجرا کنید:

```bash
npm run dev
```

آدرس محلی:

```text
http://localhost:3000
```

## اجرای کامل روی سرور

در فایل `.env` مقدارهای زیر را تغییر دهید:

```env
DATABASE_URL="postgresql://roadmap:your-strong-password@postgres:5432/roadmap?schema=public"
SESSION_SECRET="یک-رشته-خیلی-بلند-و-تصادفی"
APP_DOMAIN="roadmap.example.com"
ACME_EMAIL="admin@example.com"
POSTGRES_DB="roadmap"
POSTGRES_USER="roadmap"
POSTGRES_PASSWORD="your-strong-password"
NEXT_PUBLIC_APP_URL="https://roadmap.example.com"
```

سپس کل stack را بالا بیاورید:

```bash
docker compose up -d --build
```

برای migration و seed در محیط Docker:

```bash
docker compose exec app npx prisma migrate deploy
docker compose exec app npx prisma db seed
```

اگر دامنه واقعی تنظیم کرده باشید، Caddy به صورت خودکار certificate رایگان Let’s Encrypt می‌گیرد.

## کاربران اولیه

نام کاربری‌های اولیه در `prisma/seed.ts` تعریف شده‌اند و رمزهای اولیه از متغیرهای محیطی `INITIAL_*_PASSWORD` خوانده می‌شوند. مقدارها را قبل از اجرای seed در فایل `.env` یا محیط Docker تنظیم کنید. همه کاربران seed شده بعد از اولین ورود مجبور به تغییر رمز هستند.

## دستورهای مفید

```bash
npm run dev
npm run build
npm run test
npm run test:ui
npx prisma studio
```

## نکات امنیتی

- مقدار `SESSION_SECRET` را قبل از استقرار تغییر دهید.
- رمزهای اولیه را در Git commit نکنید؛ برای مقداردهی از متغیرهای محیطی `INITIAL_*_PASSWORD` استفاده کنید.
- اگر seed را دوباره اجرا کنید، رمز کاربران موجود reset نمی‌شود تا رمزهای تغییریافته حفظ شوند.
- دسترسی داده‌ها در API بر اساس نقش و `workspaceId` کنترل می‌شود.

ALTER TABLE "Product" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

UPDATE "Product"
SET "isActive" = "name" IN ('بازار پیشرفته', 'OTC', 'تراز', 'پرایسر و دیده‌بان', 'API همکاران', 'نرم‌افزار همکاران');

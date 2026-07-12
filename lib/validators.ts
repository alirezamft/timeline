import { Role, Status } from "@prisma/client";
import { z } from "zod";

const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "رنگ باید hex معتبر باشد.");

export const loginSchema = z.object({
  username: z.string().min(2, "نام کاربری کوتاه است.").max(80),
  password: z.string().min(6, "رمز عبور کوتاه است.")
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, "رمز فعلی را وارد کنید."),
  newPassword: z
    .string()
    .min(10, "رمز جدید باید حداقل ۱۰ کاراکتر باشد.")
    .regex(/[A-Z]/, "رمز جدید باید حداقل یک حرف بزرگ انگلیسی داشته باشد.")
    .regex(/[a-z]/, "رمز جدید باید حداقل یک حرف کوچک انگلیسی داشته باشد.")
    .regex(/[0-9]/, "رمز جدید باید حداقل یک عدد داشته باشد.")
});

export const workspaceSchema = z.object({
  name: z.string().min(2, "نام تیم الزامی است.").max(120),
  slug: z
    .string()
    .min(2, "slug الزامی است.")
    .max(80)
    .regex(/^[a-z0-9-]+$/, "slug فقط می‌تواند شامل حروف انگلیسی کوچک، عدد و خط تیره باشد.")
});

export const phaseSchema = z.object({
  label: z.string().min(1, "عنوان فاز الزامی است.").max(80),
  subtitle: z.string().max(120).optional().nullable(),
  goal: z.string().max(400).optional().nullable(),
  color: hexColor,
  order: z.coerce.number().int().min(0).max(1000)
});

export const domainSchema = z.object({
  name: z.string().min(1, "نام دامین الزامی است.").max(120),
  color: hexColor,
  order: z.coerce.number().int().min(0).max(1000)
});

export const projectSchema = z.object({
  domainId: z.string().cuid("دامین نامعتبر است."),
  startPhaseId: z.string().cuid("فاز شروع نامعتبر است."),
  name: z.string().min(2, "نام پروژه الزامی است.").max(180),
  status: z.nativeEnum(Status),
  progress: z.coerce.number().int().min(0).max(100),
  span: z.coerce.number().int().min(1).max(12),
  tag: z.string().max(80).optional().nullable(),
  note: z.string().max(1000).optional().nullable()
});

export const userCreateSchema = z
  .object({
    fullName: z.string().min(2, "نام نمایشی الزامی است.").max(120),
    username: z.string().min(2, "نام کاربری الزامی است.").max(80),
    password: z.string().min(10, "رمز عبور باید حداقل ۱۰ کاراکتر باشد."),
    role: z.nativeEnum(Role),
    workspaceId: z.string().cuid().optional().nullable(),
    mustChangePassword: z.boolean().optional()
  })
  .superRefine((value, context) => {
    if (value.role !== "SUPER_ADMIN" && !value.workspaceId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["workspaceId"],
        message: "برای این نقش باید workspace انتخاب شود."
      });
    }
  });

export const userUpdateSchema = z
  .object({
    fullName: z.string().min(2).max(120).optional(),
    password: z.string().min(10).optional().or(z.literal("")),
    role: z.nativeEnum(Role).optional(),
    workspaceId: z.string().cuid().optional().nullable(),
    mustChangePassword: z.boolean().optional()
  })
  .superRefine((value, context) => {
    if (value.role && value.role !== "SUPER_ADMIN" && value.workspaceId === null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["workspaceId"],
        message: "برای این نقش باید workspace انتخاب شود."
      });
    }
  });

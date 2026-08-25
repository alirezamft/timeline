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

const workflowStatuses = [
  "BACKLOG",
  "READY_FOR_DEVELOPMENT",
  "IN_PROGRESS",
  "CODE_REVIEW",
  "READY_FOR_QA",
  "IN_QA",
  "REWORK",
  "READY_FOR_RELEASE",
  "DONE",
  "BLOCKED",
  "PAUSED",
  "CANCELED",
  "OUT_OF_SCOPE"
] as const;

const workItemTypes = ["EPIC", "STORY", "TASK", "SUBTASK", "BUG", "MILESTONE"] as const;

export const workItemSchema = z.object({
  productId: z.string().cuid().optional().nullable(),
  initiativeId: z.string().cuid().optional().nullable(),
  parentId: z.string().cuid().optional().nullable(),
  type: z.enum(workItemTypes),
  title: z.string().min(1, "عنوان کار الزامی است.").max(240),
  description: z.string().max(5000).optional().nullable(),
  status: z.enum(workflowStatuses).default("BACKLOG"),
  ownerId: z.string().cuid().optional().nullable(),
  team: z.string().max(120).optional().nullable(),
  startDate: z.coerce.date().optional().nullable(),
  dueDate: z.coerce.date().optional().nullable(),
  storyPoints: z.coerce.number().min(0).max(10000).optional().nullable(),
  originalEstimate: z.coerce.number().int().min(0).max(100000).optional().nullable(),
  jiraIssueKey: z.string().max(80).optional().nullable(),
  jiraIssueId: z.string().max(120).optional().nullable(),
  jiraUrl: z.string().url().max(1000).optional().nullable()
});

export const workItemUpdateSchema = workItemSchema.partial().extend({
  scopeState: z.enum(["COMMITTED", "CANDIDATE", "CANCELED", "OUT_OF_SCOPE"]).optional()
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

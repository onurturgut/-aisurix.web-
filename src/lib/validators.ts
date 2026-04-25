import { z } from "zod";

export const projectInputSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  long_description: z.string().trim().nullable().optional(),
  status: z.string().trim().min(1).default("Yayında"),
  tags: z.array(z.string().trim()).default([]),
  icon: z.string().trim().nullable().optional(),
  link: z.string().trim().url().nullable().or(z.literal("")).optional(),
  display_order: z.number().int().default(0),
});

export const contactInputSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  phone: z.string().trim().regex(/^\d{11}$/, "Telefon numarasi 11 haneli olmalidir."),
  type: z.string().trim().nullable().optional(),
  detail: z.string().trim().min(1),
});

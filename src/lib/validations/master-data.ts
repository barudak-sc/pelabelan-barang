import { z } from "zod";

// ---- Categories ----
export const categorySchema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi").max(100),
  codePrefix: z
    .string()
    .min(2, "Kode prefix minimal 2 karakter")
    .max(5, "Kode prefix maksimal 5 karakter")
    .toUpperCase()
    .regex(/^[A-Z]+$/, "Kode prefix hanya boleh huruf kapital"),
  description: z.string().max(500).optional().or(z.literal("")),
});
export type CategoryFormData = z.infer<typeof categorySchema>;

// ---- Locations ----
export const locationSchema = z.object({
  name: z.string().min(1, "Nama lokasi wajib diisi").max(100),
  building: z.string().max(100).optional().or(z.literal("")),
  floor: z.string().max(20).optional().or(z.literal("")),
  description: z.string().max(500).optional().or(z.literal("")),
});
export type LocationFormData = z.infer<typeof locationSchema>;

// ---- Fund Sources ----
export const fundSourceSchema = z.object({
  name: z.string().min(1, "Nama sumber dana wajib diisi").max(100),
});
export type FundSourceFormData = z.infer<typeof fundSourceSchema>;

// ---- Conditions ----
export const conditionSchema = z.object({
  name: z.string().min(1, "Nama kondisi wajib diisi").max(50),
  severityLevel: z.coerce
    .number()
    .int()
    .min(1, "Severity minimal 1")
    .max(10, "Severity maksimal 10"),
});
export type ConditionFormData = z.infer<typeof conditionSchema>;

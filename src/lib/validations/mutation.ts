import { z } from "zod";

export const mutationSchema = z.object({
  assetId: z.string().uuid("Aset wajib dipilih"),
  toUser: z.string().min(1, "Nama pengguna baru wajib diisi").max(100),
  toPosition: z.string().max(100).optional().or(z.literal("")),
  mutationDate: z.string().min(1, "Tanggal mutasi wajib diisi"),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export type MutationFormData = z.infer<typeof mutationSchema>;

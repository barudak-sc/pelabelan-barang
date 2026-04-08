import { z } from "zod";

export const userCreateSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter").max(50),
  password: z.string().min(6, "Password minimal 6 karakter").max(100),
  name: z.string().min(1, "Nama wajib diisi").max(100),
  role: z.enum(["ADMIN", "VIEWER"]),
});
export type UserCreateFormData = z.infer<typeof userCreateSchema>;

export const userUpdateSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter").max(50),
  password: z.string().max(100).optional().or(z.literal("")),
  name: z.string().min(1, "Nama wajib diisi").max(100),
  role: z.enum(["ADMIN", "VIEWER"]),
});
export type UserUpdateFormData = z.infer<typeof userUpdateSchema>;

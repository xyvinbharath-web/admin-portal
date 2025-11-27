import { z } from "zod";

export const updateRoleSchema = z.object({
  role: z.enum(["user", "partner_request", "partner", "admin"]),
});

export const updateStatusSchema = z.object({
  status: z.enum(["active", "pending", "suspended"]),
});

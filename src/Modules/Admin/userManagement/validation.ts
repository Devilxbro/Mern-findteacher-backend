/**
 * validations/user.validation.ts
 * -----------------------------------------------------
 * Zod validation schemas for Admin User APIs
 */

import { z } from "zod";

export const listUsersQuerySchema = z.object({
    page: z.string().regex(/^\d+$/, "Page must be a number").optional(),
    limit: z.string().regex(/^\d+$/, "Limit must be a number").optional(),
    q: z.string().min(2, "Search query too short").optional(),
    role: z.enum(["student", "teacher", "admin"]).optional(),
});

export const userIdParamSchema = z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"),
});

export const updateStatusBodySchema = z.object({
    isActive: z.boolean().refine(val => typeof val === 'boolean', {
        message: "isActive must be a boolean"
    }),

});

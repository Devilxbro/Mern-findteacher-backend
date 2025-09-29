import { z } from "zod";

// Query for list users
export const listUsersQuerySchema = z.object({
    page: z.string().regex(/^\d+$/, "Page must be a number").optional(),
    limit: z.string().regex(/^\d+$/, "Limit must be a number").optional(),
    q: z.string().min(2, "Search query too short").optional(),
    role: z.enum(["student", "teacher", "admin"]).optional(),
});

// Params validation
export const userIdParamSchema = z.object({
    id: z.string().refine(val => /^[0-9a-fA-F]{24}$/.test(val), {
        message: "Invalid MongoDB ObjectId",
    }),
});

// Body for status update
export const updateStatusBodySchema = z.object({
    isActive: z.boolean(),
});

// Teacher query params
export const listTeachersQuerySchema = z.object({
    isPremium: z.string().optional(),
    isFeatured: z.string().optional(),
    minRating: z.string().optional(),
});

// Review body
export const addReviewBodySchema = z.object({
    studentId: z.string().refine(val => /^[0-9a-fA-F]{24}$/.test(val), { message: "Invalid student ID" }),
    rating: z.number().min(1).max(5),
    comment: z.string().optional(),
});

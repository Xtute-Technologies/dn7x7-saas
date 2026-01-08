import * as z from "zod";

// --- RESPONSE SCHEMAS (What the API sends back) ---

export const userResponseSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  organization: z.string().nullable().optional(),
  profile_image: z.string().nullable().optional(), // URL or null
  role: z.enum(["admin", "user"]),
  is_staff: z.boolean(),
  is_active: z.boolean().optional(), // Django standard user field
});


// --- REQUEST SCHEMAS (What you send to the form) ---

// 1. Create User (Standard Djoser-like fields + your extras)
export const createUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(1, "Name is required"),
  organization: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  // Note: File uploads usually handled separately from JSON schemas in frontend logic
});

// 2. Update User (Partial updates allowed)
export const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  organization: z.string().optional(),
  is_active: z.boolean().optional(),
  is_staff: z.boolean().optional(), // Added for admin permission changes
});

// 3. Add/Remove Credits Action
export const addCreditsSchema = z.object({
  credits: z.coerce
    .number()
    .int("Credits must be a whole number")
    .refine((val) => val !== 0, "Credit amount cannot be zero"),
});
import * as z from "zod";

// --- API KEY SCHEMAS ---

// 1. Schema for CREATING a new API Key
export const createAPIKeySchema = z.object({
  name: z.string().min(1, "Key name is required").max(50, "Name is too long"),
  daily_limit: z.coerce // coerce handles string-to-number conversion from inputs
    .number()
    .min(1, "Limit must be at least 1")
    .optional()
    .default(1000),
});

// 2. Schema for UPDATING an API Key (e.g., renaming or toggling active status)
export const updateAPIKeySchema = z.object({
  name: z.string().min(1, "Key name is required").max(50).optional(),
  is_active: z.boolean().optional(),
});

// 3. Schema for the API Key DATA returned from the backend (for TypeScript/Verification)
export const apiKeyResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  key: z.string(), // The actual secret key
  created_at: z.string(), // ISO Date string
  is_active: z.boolean(),
  daily_limit: z.number(),
});


// --- CREDIT SCHEMAS ---

// 4. Schema for viewing Credit Balance
export const creditBalanceSchema = z.object({
  daily_free_credits: z.number(),
  purchased_credits: z.number(),
  remaining_credits: z.number(), // This is the calculated total from your serializer
});


// --- LOGS & ANALYTICS SCHEMAS ---

// 5. Schema for a single Log Entry
export const logEntrySchema = z.object({
  endpoint: z.string(),
  method: z.string(),
  status_code: z.number(),
  ip_address: z.string().nullable(),
  timestamp: z.string(), // ISO Date string
});

// 6. Schema for Filtering/Querying Logs (for your Charts)
// Use this to validate the filter controls on your dashboard
export const logsFilterSchema = z.object({
  time_range: z.enum(["1h", "24h", "7d", "30d"], {
    errorMap: () => ({ message: "Invalid time range selected" }),
  }).default("24h"),
  
  status_filter: z.enum(["all", "success", "error"]).default("all"),
});
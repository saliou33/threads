import * as z from "zod";

export const threadValidation = z.object({
  thread: z.string().min(3),
  accountId: z.string(),
});

export const commentValidation = z.object({
  thread: z.string().min(3),
  accountId: z.string(),
});

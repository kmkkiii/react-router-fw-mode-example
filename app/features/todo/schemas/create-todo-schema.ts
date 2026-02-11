import { z } from 'zod';

export const createTodoSchema = z.object({
  intent: z.literal('create'),
  title: z
    .string()
    .trim()
    .min(1, 'タイトルを入力してください')
    .max(100, 'タイトルは100文字以内で入力してください'),
});

export type CreateTodoFormData = z.infer<typeof createTodoSchema>;

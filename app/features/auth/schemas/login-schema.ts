import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('正しいメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

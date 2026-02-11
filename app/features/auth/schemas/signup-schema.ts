import { z } from 'zod';

export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, '名前を入力してください')
    .max(50, '名前は50文字以内で入力してください'),
  email: z.email('正しいメールアドレスを入力してください'),
  password: z
    .string()
    .min(8, 'パスワードは8文字以上で入力してください')
    .max(128, 'パスワードは128文字以内で入力してください'),
});

export type SignupFormData = z.infer<typeof signupSchema>;

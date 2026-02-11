import type { SubmissionResult } from '@conform-to/react';
import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { Form, useNavigation } from 'react-router';
import { loginSchema } from '../schemas/login-schema';

type LoginFormProps = {
  lastResult?: SubmissionResult | null;
};

export function LoginForm({ lastResult }: LoginFormProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: loginSchema });
    },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
  });

  return (
    <Form method="post" {...getFormProps(form)} className="space-y-4">
      <div>
        <label htmlFor={fields.email.id} className="block text-sm font-medium">
          メールアドレス
        </label>
        <input
          {...getInputProps(fields.email, { type: 'email' })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
        {fields.email.errors && (
          <div className="mt-1 text-sm text-red-600">{fields.email.errors[0]}</div>
        )}
      </div>
      <div>
        <label htmlFor={fields.password.id} className="block text-sm font-medium">
          パスワード
        </label>
        <input
          {...getInputProps(fields.password, { type: 'password' })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
        {fields.password.errors && (
          <div className="mt-1 text-sm text-red-600">{fields.password.errors[0]}</div>
        )}
      </div>
      {form.errors && <div className="text-red-600 text-sm">{form.errors[0]}</div>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? 'ログイン中...' : 'ログイン'}
      </button>
    </Form>
  );
}

import { parseWithZod } from '@conform-to/zod';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { Link, redirect, useActionData } from 'react-router';
import { LoginForm } from '~/features/auth/components/login-form';
import { loginSchema } from '~/features/auth/schemas/login-schema';
import { auth } from '~/shared/auth/auth.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session) {
    return redirect('/todos');
  }

  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: loginSchema });

  if (submission.status !== 'success') {
    return { lastResult: submission.reply() };
  }

  const { email, password } = submission.value;

  const response = await auth.api.signInEmail({
    body: { email, password },
    asResponse: true,
  });

  if (!response.ok) {
    return {
      lastResult: submission.reply({
        formErrors: ['メールアドレスまたはパスワードが正しくありません'],
      }),
    };
  }

  const setCookieHeader = response.headers.get('Set-Cookie');
  return redirect('/todos', {
    headers: setCookieHeader ? { 'Set-Cookie': setCookieHeader } : undefined,
  });
}

export default function Login() {
  const actionData = useActionData<typeof action>();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-3xl font-bold text-center">ログイン</h2>
        </div>
        <LoginForm lastResult={actionData?.lastResult} />
        <div className="text-center text-sm">
          <span className="text-gray-600">アカウントをお持ちでない方は </span>
          <Link to="/signup" className="text-blue-600 hover:underline">
            サインアップ
          </Link>
        </div>
      </div>
    </div>
  );
}

import { parseWithZod } from '@conform-to/zod';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { Link, redirect, useActionData } from 'react-router';
import { SignupForm } from '~/features/auth/components/signup-form';
import { signupSchema } from '~/features/auth/schemas/signup-schema';
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
  const submission = parseWithZod(formData, { schema: signupSchema });

  if (submission.status !== 'success') {
    return { lastResult: submission.reply({ hideFields: ['password'] }) };
  }

  const { name, email, password } = submission.value;

  const response = await auth.api.signUpEmail({
    body: { name, email, password },
    asResponse: true,
  });

  if (!response.ok) {
    return {
      lastResult: submission.reply({
        formErrors: ['サインアップに失敗しました'],
        hideFields: ['password'],
      }),
    };
  }

  const setCookieHeader = response.headers.get('Set-Cookie');
  return redirect('/todos', {
    headers: setCookieHeader ? { 'Set-Cookie': setCookieHeader } : undefined,
  });
}

export default function Signup() {
  const actionData = useActionData<typeof action>();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-3xl font-bold text-center">サインアップ</h2>
        </div>
        <SignupForm lastResult={actionData?.lastResult} />
        <div className="text-center text-sm">
          <span className="text-gray-600">すでにアカウントをお持ちの方は </span>
          <Link to="/login" className="text-blue-600 hover:underline">
            ログイン
          </Link>
        </div>
      </div>
    </div>
  );
}

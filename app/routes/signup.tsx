import type { LoaderFunctionArgs } from 'react-router';
import { Link, redirect } from 'react-router';
import { SignupForm } from '~/features/auth/components/signup-form';
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

export default function Signup() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-3xl font-bold text-center">サインアップ</h2>
        </div>
        <SignupForm />
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

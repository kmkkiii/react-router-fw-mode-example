import type { LoaderFunctionArgs } from 'react-router';
import { Link, redirect } from 'react-router';
import { LoginForm } from '~/features/auth/components/login-form';
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

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-3xl font-bold text-center">ログイン</h2>
        </div>
        <LoginForm />
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

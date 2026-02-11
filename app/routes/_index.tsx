import type { LoaderFunctionArgs } from 'react-router';
import { redirect } from 'react-router';
import { auth } from '~/shared/auth/auth.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session) {
    return redirect('/todos');
  }

  return redirect('/login');
}

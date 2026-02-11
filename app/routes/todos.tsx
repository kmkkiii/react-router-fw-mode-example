import { parseWithZod } from '@conform-to/zod';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { redirect, useActionData, useLoaderData } from 'react-router';
import {
  createTodo,
  deleteTodo,
  getTodosByUserId,
  toggleTodo,
} from '~/entities/todo/repository.server';
import { CreateTodoForm } from '~/features/todo/components/create-todo-form';
import { TodoList } from '~/features/todo/components/todo-list';
import { createTodoSchema } from '~/features/todo/schemas/create-todo-schema';
import { authClient } from '~/shared/auth/auth.client';
import { auth } from '~/shared/auth/auth.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return redirect('/login');
  }

  const todos = await getTodosByUserId(session.user.id);

  return { todos, user: session.user };
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return redirect('/login');
  }

  const formData = await request.formData();
  const intent = formData.get('intent');

  switch (intent) {
    case 'create': {
      const submission = parseWithZod(formData, { schema: createTodoSchema });

      if (submission.status !== 'success') {
        return { lastResult: submission.reply() };
      }

      await createTodo(session.user.id, submission.value.title);
      return { lastResult: submission.reply({ resetForm: true }) };
    }
    case 'toggle': {
      const todoId = formData.get('todoId');
      if (typeof todoId === 'string') {
        await toggleTodo(todoId, session.user.id);
      }
      return { lastResult: null };
    }
    case 'delete': {
      const todoId = formData.get('todoId');
      if (typeof todoId === 'string') {
        await deleteTodo(todoId, session.user.id);
      }
      return { lastResult: null };
    }
    default:
      return { lastResult: null };
  }
}

export default function Todos() {
  const { todos, user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  async function handleSignOut() {
    await authClient.signOut();
    window.location.href = '/login';
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Todo リスト</h1>
              <p className="text-gray-600 text-sm mt-1">ようこそ、{user.name}さん</p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              サインアウト
            </button>
          </div>
          <div className="mb-6">
            <CreateTodoForm lastResult={actionData?.lastResult} />
          </div>
          <TodoList todos={todos} />
        </div>
      </div>
    </div>
  );
}

import { Form } from 'react-router';
import type { Todo } from '~/entities/todo/types';

interface TodoItemProps {
  todo: Todo;
}

export function TodoItem({ todo }: TodoItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-md border border-gray-200">
      <Form method="post" className="flex items-center">
        <input type="hidden" name="intent" value="toggle" />
        <input type="hidden" name="todoId" value={todo.id} />
        <button
          type="submit"
          className="flex items-center justify-center w-5 h-5 rounded border-2 border-gray-300 hover:border-blue-500"
        >
          {todo.completed && (
            <svg
              className="w-4 h-4 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              role="img"
              aria-label="完了"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </button>
      </Form>
      <span className={`flex-1 ${todo.completed ? 'line-through text-gray-500' : ''}`}>
        {todo.title}
      </span>
      <Form method="post">
        <input type="hidden" name="intent" value="delete" />
        <input type="hidden" name="todoId" value={todo.id} />
        <button type="submit" className="text-red-600 hover:text-red-800 text-sm">
          削除
        </button>
      </Form>
    </div>
  );
}

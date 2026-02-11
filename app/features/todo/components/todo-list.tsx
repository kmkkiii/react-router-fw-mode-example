import type { Todo } from '~/entities/todo/types';
import { TodoItem } from './todo-item';

interface TodoListProps {
  todos: Todo[];
}

export function TodoList({ todos }: TodoListProps) {
  if (todos.length === 0) {
    return <div className="text-center text-gray-500 py-8">Todoがありません</div>;
  }

  return (
    <div className="space-y-2">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </div>
  );
}

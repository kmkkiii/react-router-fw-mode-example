import type { Todo } from '~/entities/todo/types';

let idCounter = 0;

export function buildTodo(overrides: Partial<Todo> = {}): Todo {
  idCounter += 1;
  return {
    id: `test-todo-${idCounter}`,
    userId: 'test-user-id',
    title: 'Test Todo',
    completed: false,
    createdAt: new Date(),
    ...overrides,
  };
}

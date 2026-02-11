import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as todoRepository from '~/entities/todo/repository.server';
import type { Todo } from '~/entities/todo/types';
import { auth } from '~/shared/auth/auth.server';
import { action, loader } from './todos';

vi.mock('~/shared/auth/auth.server', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('~/entities/todo/repository.server', () => ({
  getTodosByUserId: vi.fn(),
  createTodo: vi.fn(),
  toggleTodo: vi.fn(),
  deleteTodo: vi.fn(),
}));

describe('Todos Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loader', () => {
    it('未認証の場合は /login にリダイレクトする', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const request = new Request('http://localhost/todos');
      const result = await loader({
        request,
        params: {},
        context: {},
        unstable_pattern: '',
      });

      expect((result as Response).status).toBe(302);
      expect((result as Response).headers.get('Location')).toBe('/login');
    });

    it('認証済みの場合は Todo リストを返す', async () => {
      const mockUser = { id: 'user-1', name: 'Test User', email: 'test@example.com' };
      const mockTodos: Todo[] = [
        {
          id: 'todo-1',
          userId: 'user-1',
          title: 'Test Todo',
          completed: false,
          createdAt: new Date(),
        },
      ];

      vi.mocked(auth.api.getSession).mockResolvedValue({
        session: { id: 'session-1' },
        user: mockUser,
      } as never);
      vi.mocked(todoRepository.getTodosByUserId).mockResolvedValue(mockTodos as never);

      const request = new Request('http://localhost/todos');
      const result = await loader({
        request,
        params: {},
        context: {},
        unstable_pattern: '',
      });

      expect(result).toEqual({ todos: mockTodos, user: mockUser });
      expect(todoRepository.getTodosByUserId).toHaveBeenCalledWith('user-1');
    });
  });

  describe('action', () => {
    const mockUser = { id: 'user-1', name: 'Test User', email: 'test@example.com' };

    beforeEach(() => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        session: { id: 'session-1' },
        user: mockUser,
      } as never);
    });

    it('create intent で新しい Todo を作成する', async () => {
      const formData = new FormData();
      formData.append('intent', 'create');
      formData.append('title', 'New Todo');

      const request = new Request('http://localhost/todos', {
        method: 'POST',
        body: formData,
      });

      const result = await action({
        request,
        params: {},
        context: {},
        unstable_pattern: '',
      });

      expect(todoRepository.createTodo).toHaveBeenCalledWith('user-1', 'New Todo');
      expect(result).toBeNull();
    });

    it('create intent で空のタイトルの場合は作成しない', async () => {
      const formData = new FormData();
      formData.append('intent', 'create');
      formData.append('title', '   ');

      const request = new Request('http://localhost/todos', {
        method: 'POST',
        body: formData,
      });

      const result = await action({
        request,
        params: {},
        context: {},
        unstable_pattern: '',
      });

      expect(todoRepository.createTodo).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('toggle intent で Todo を切り替える', async () => {
      const formData = new FormData();
      formData.append('intent', 'toggle');
      formData.append('todoId', 'todo-1');

      const request = new Request('http://localhost/todos', {
        method: 'POST',
        body: formData,
      });

      const result = await action({
        request,
        params: {},
        context: {},
        unstable_pattern: '',
      });

      expect(todoRepository.toggleTodo).toHaveBeenCalledWith('todo-1', 'user-1');
      expect(result).toBeNull();
    });

    it('delete intent で Todo を削除する', async () => {
      const formData = new FormData();
      formData.append('intent', 'delete');
      formData.append('todoId', 'todo-1');

      const request = new Request('http://localhost/todos', {
        method: 'POST',
        body: formData,
      });

      const result = await action({
        request,
        params: {},
        context: {},
        unstable_pattern: '',
      });

      expect(todoRepository.deleteTodo).toHaveBeenCalledWith('todo-1', 'user-1');
      expect(result).toBeNull();
    });

    it('不明な intent の場合は null を返す', async () => {
      const formData = new FormData();
      formData.append('intent', 'unknown');

      const request = new Request('http://localhost/todos', {
        method: 'POST',
        body: formData,
      });

      const result = await action({
        request,
        params: {},
        context: {},
        unstable_pattern: '',
      });

      expect(result).toBeNull();
    });
  });
});

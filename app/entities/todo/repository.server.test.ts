import { and, eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '~/shared/db/client.server';
import { todo } from '../../../db/schema';
import { createTodo, deleteTodo, getTodosByUserId, toggleTodo } from './repository.server';

vi.mock('~/shared/db/client.server', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Todo Repository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTodosByUserId', () => {
    it('指定されたユーザーの Todo リストを取得できる', async () => {
      const mockTodos = [
        {
          id: 'todo-1',
          userId: 'user-1',
          title: 'Test Todo',
          completed: false,
          createdAt: new Date(),
        },
      ];

      const whereMock = vi.fn().mockResolvedValue(mockTodos);
      const fromMock = vi.fn().mockReturnValue({ where: whereMock });
      vi.mocked(db.select).mockReturnValue({ from: fromMock } as never);

      const result = await getTodosByUserId('user-1');

      expect(db.select).toHaveBeenCalled();
      expect(fromMock).toHaveBeenCalledWith(todo);
      expect(whereMock).toHaveBeenCalledWith(eq(todo.userId, 'user-1'));
      expect(result).toEqual(mockTodos);
    });
  });

  describe('createTodo', () => {
    it('新しい Todo を作成できる', async () => {
      const mockTodo = {
        id: 'todo-1',
        userId: 'user-1',
        title: 'New Todo',
        completed: false,
        createdAt: new Date(),
      };

      const returningMock = vi.fn().mockResolvedValue([mockTodo]);
      const valuesMock = vi.fn().mockReturnValue({ returning: returningMock });
      vi.mocked(db.insert).mockReturnValue({ values: valuesMock } as never);

      const result = await createTodo('user-1', 'New Todo');

      expect(db.insert).toHaveBeenCalledWith(todo);
      expect(valuesMock).toHaveBeenCalledWith({ userId: 'user-1', title: 'New Todo' });
      expect(returningMock).toHaveBeenCalled();
      expect(result).toEqual(mockTodo);
    });
  });

  describe('toggleTodo', () => {
    it('Todo の完了状態を切り替えられる', async () => {
      const existingTodo = {
        id: 'todo-1',
        userId: 'user-1',
        title: 'Test Todo',
        completed: false,
        createdAt: new Date(),
      };

      const updatedTodo = { ...existingTodo, completed: true };

      // SELECT のモック
      const selectWhereMock = vi.fn().mockResolvedValue([existingTodo]);
      const selectFromMock = vi.fn().mockReturnValue({ where: selectWhereMock });
      vi.mocked(db.select).mockReturnValue({ from: selectFromMock } as never);

      // UPDATE のモック
      const updateReturningMock = vi.fn().mockResolvedValue([updatedTodo]);
      const updateWhereMock = vi.fn().mockReturnValue({ returning: updateReturningMock });
      const updateSetMock = vi.fn().mockReturnValue({ where: updateWhereMock });
      vi.mocked(db.update).mockReturnValue({ set: updateSetMock } as never);

      const result = await toggleTodo('todo-1', 'user-1');

      expect(db.select).toHaveBeenCalled();
      expect(selectWhereMock).toHaveBeenCalledWith(
        and(eq(todo.id, 'todo-1'), eq(todo.userId, 'user-1')),
      );
      expect(db.update).toHaveBeenCalledWith(todo);
      expect(updateSetMock).toHaveBeenCalledWith({ completed: true });
      expect(result).toEqual(updatedTodo);
    });

    it('存在しない Todo の場合はエラーを投げる', async () => {
      const selectWhereMock = vi.fn().mockResolvedValue([]);
      const selectFromMock = vi.fn().mockReturnValue({ where: selectWhereMock });
      vi.mocked(db.select).mockReturnValue({ from: selectFromMock } as never);

      await expect(toggleTodo('non-existent', 'user-1')).rejects.toThrow('Todo not found');
    });
  });

  describe('deleteTodo', () => {
    it('Todo を削除できる', async () => {
      const whereMock = vi.fn().mockResolvedValue(undefined);
      vi.mocked(db.delete).mockReturnValue({ where: whereMock } as never);

      await deleteTodo('todo-1', 'user-1');

      expect(db.delete).toHaveBeenCalledWith(todo);
      expect(whereMock).toHaveBeenCalledWith(and(eq(todo.id, 'todo-1'), eq(todo.userId, 'user-1')));
    });
  });
});

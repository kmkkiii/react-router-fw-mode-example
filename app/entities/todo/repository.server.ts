import { and, eq } from 'drizzle-orm';
import { db } from '~/shared/db/client.server';
import { todo } from '../../../db/schema';

export async function getTodosByUserId(userId: string) {
  return db.select().from(todo).where(eq(todo.userId, userId));
}

export async function createTodo(userId: string, title: string) {
  const [newTodo] = await db.insert(todo).values({ userId, title }).returning();
  return newTodo;
}

export async function toggleTodo(todoId: string, userId: string) {
  const [existingTodo] = await db
    .select()
    .from(todo)
    .where(and(eq(todo.id, todoId), eq(todo.userId, userId)));

  if (!existingTodo) {
    throw new Error('Todo not found');
  }

  const [updatedTodo] = await db
    .update(todo)
    .set({ completed: !existingTodo.completed })
    .where(eq(todo.id, todoId))
    .returning();

  return updatedTodo;
}

export async function deleteTodo(todoId: string, userId: string) {
  await db.delete(todo).where(and(eq(todo.id, todoId), eq(todo.userId, userId)));
}

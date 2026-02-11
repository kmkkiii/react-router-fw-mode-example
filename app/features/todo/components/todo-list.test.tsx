import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { buildTodo } from '~/test/factories';
import { renderWithRouter } from '~/test/helpers';
import { TodoList } from './todo-list';

describe('TodoList', () => {
  it('Todo が空の場合はメッセージを表示する', () => {
    renderWithRouter(<TodoList todos={[]} />);

    expect(screen.getByText('Todoがありません')).toBeInTheDocument();
  });

  it('複数の Todo を描画する', () => {
    const todos = [buildTodo({ title: 'Todo 1' }), buildTodo({ title: 'Todo 2' })];

    renderWithRouter(<TodoList todos={todos} />);

    expect(screen.getByText('Todo 1')).toBeInTheDocument();
    expect(screen.getByText('Todo 2')).toBeInTheDocument();
  });
});

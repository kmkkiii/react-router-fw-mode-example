import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { buildTodo } from '~/test/factories';
import { renderWithRouter } from '~/test/helpers';
import { TodoItem } from './todo-item';

describe('TodoItem', () => {
  it('未完了の Todo を表示する', () => {
    const todo = buildTodo({ title: 'Test Todo', completed: false });

    renderWithRouter(<TodoItem todo={todo} />);

    const titleElement = screen.getByText('Test Todo');
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).not.toHaveClass('line-through');
  });

  it('完了済みの Todo は line-through スタイルが適用される', () => {
    const todo = buildTodo({ title: 'Completed Todo', completed: true });

    renderWithRouter(<TodoItem todo={todo} />);

    const titleElement = screen.getByText('Completed Todo');
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveClass('line-through');
  });

  it('toggle フォームと delete フォームを持つ', () => {
    const todo = buildTodo({ id: 'todo-1', title: 'Test Todo' });

    renderWithRouter(<TodoItem todo={todo} />);

    // toggle フォームの確認（intent=toggle の hidden input を探す）
    const toggleIntent = document.querySelector('input[name="intent"][value="toggle"]');
    expect(toggleIntent).toBeInTheDocument();

    // delete ボタンの確認
    const deleteButton = screen.getByText('削除');
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveAttribute('type', 'submit');
  });
});

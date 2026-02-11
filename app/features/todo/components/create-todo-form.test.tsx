import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithRouter } from '~/test/helpers';
import { CreateTodoForm } from './create-todo-form';

describe('CreateTodoForm', () => {
  it('必要なフォーム要素を持つ', () => {
    renderWithRouter(<CreateTodoForm />);

    // hidden intent フィールド
    const intentInput = document.querySelector('input[name="intent"]');
    expect(intentInput).toBeInTheDocument();
    expect(intentInput).toHaveAttribute('type', 'hidden');
    expect(intentInput).toHaveValue('create');

    // title input (required)
    const titleInput = screen.getByPlaceholderText('新しいTodoを入力...');
    expect(titleInput).toBeInTheDocument();
    expect(titleInput).toHaveAttribute('required');
    expect(titleInput).toHaveAttribute('name', 'title');

    // submit button
    const submitButton = screen.getByRole('button', { name: '追加' });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveAttribute('type', 'submit');
  });
});

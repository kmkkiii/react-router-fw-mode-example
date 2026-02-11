import type { SubmissionResult } from '@conform-to/react';
import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod/v4';
import { Form } from 'react-router';
import { createTodoSchema } from '../schemas/create-todo-schema';

type CreateTodoFormProps = {
  lastResult?: SubmissionResult | null;
};

export function CreateTodoForm({ lastResult }: CreateTodoFormProps) {
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: createTodoSchema });
    },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
  });

  return (
    <Form method="post" {...getFormProps(form)} className="flex flex-col gap-2">
      <input type="hidden" name="intent" value="create" />
      <div className="flex gap-2">
        <div className="flex-1">
          <input
            {...getInputProps(fields.title, { type: 'text' })}
            placeholder="新しいTodoを入力..."
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
          {fields.title.errors && (
            <div className="mt-1 text-sm text-red-600">{fields.title.errors[0]}</div>
          )}
        </div>
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          追加
        </button>
      </div>
    </Form>
  );
}

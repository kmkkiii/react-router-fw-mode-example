import { Form } from 'react-router';

export function CreateTodoForm() {
  return (
    <Form method="post" className="flex gap-2">
      <input type="hidden" name="intent" value="create" />
      <input
        type="text"
        name="title"
        placeholder="新しいTodoを入力..."
        required
        className="flex-1 rounded-md border border-gray-300 px-3 py-2"
      />
      <button
        type="submit"
        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        追加
      </button>
    </Form>
  );
}

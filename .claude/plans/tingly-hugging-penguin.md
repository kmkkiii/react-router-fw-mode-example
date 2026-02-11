# Conform + Zod 導入計画

## Context

現在のフォームバリデーションに以下の課題がある：
1. **Todo 作成フォーム** — action がエラーを返さず、ユーザーにフィードバックがない
2. **認証フォーム** — `<form onSubmit>` + `useState` x4 で手動管理。React Router の `<Form>` + `action` パターンを使っていない
3. **全フォーム共通** — サーバーサイドバリデーションが HTML `required` 属性頼り

Conform + Zod を導入し、サーバー/クライアントでバリデーションスキーマを共有する。認証フォームは `<Form>` + `action` パターンに移行する。

---

## Step 1: パッケージインストール

```bash
npm install @conform-to/react @conform-to/zod zod
```

---

## Step 2: Zod スキーマ作成（3ファイル新規作成）

| ファイル | 内容 |
|---------|------|
| `app/features/todo/schemas/create-todo-schema.ts` | `intent: z.literal('create')`, `title: z.string().trim().min(1).max(100)` |
| `app/features/auth/schemas/login-schema.ts` | `email: z.string().email()`, `password: z.string().min(1)` |
| `app/features/auth/schemas/signup-schema.ts` | `name: z.string().trim().min(1).max(50)`, `email: z.string().email()`, `password: z.string().min(8).max(128)` |

エラーメッセージは日本語で定義する。

---

## Step 3: Todo フォーム修正

### `app/routes/todos.tsx` — action 修正

- `case 'create'` を `parseWithZod(formData, { schema: createTodoSchema })` に変更
- バリデーション失敗時は `{ lastResult: submission.reply() }` を返す
- 成功時は `{ lastResult: submission.reply({ resetForm: true }) }` を返す
- `toggle` / `delete` / `default` は `{ lastResult: null }` を返す（`return null` から変更）

### `app/features/todo/components/create-todo-form.tsx` — 全面書き換え

- `useForm` + `getFormProps` + `getInputProps` で Conform 化
- `useActionData<{ lastResult: unknown }>()` で action の結果を取得
- `shouldValidate: 'onBlur'`, `shouldRevalidate: 'onInput'`
- `fields.title.errors` でエラーメッセージを表示
- hidden input `intent="create"` はそのまま維持

---

## Step 4: ログインフォーム修正

### `app/routes/login.tsx` — action 追加

- `parseWithZod(formData, { schema: loginSchema })` でバリデーション
- サーバーサイドで `auth.api.signInEmail({ body: { email, password }, asResponse: true })` を呼ぶ
- 成功: `Set-Cookie` ヘッダーを転送して `redirect('/todos')`
- 失敗: `submission.reply({ formErrors: ['メールアドレスまたはパスワードが正しくありません'] })`
- `useActionData` で `lastResult` を取得して `LoginForm` に props で渡す

### `app/features/auth/components/login-form.tsx` — 全面書き換え

- `useState` x4 と `authClient` インポートを削除
- props で `lastResult` を受け取る
- `useForm` + Conform のヘルパーで構築
- `useNavigation().state === 'submitting'` でローディング状態を管理
- `form.errors` でサーバーエラー（認証失敗）を表示

---

## Step 5: サインアップフォーム修正

### `app/routes/signup.tsx` — action 追加

- ログインと同パターン、`auth.api.signUpEmail` を使用
- エラー時は `hideFields: ['password']` でパスワードをクライアントに返さない

### `app/features/auth/components/signup-form.tsx` — 全面書き換え

- ログインフォームと同パターン、`name` フィールドが追加

---

## Step 6: テスト更新

### `app/routes/todos.test.ts`

action の戻り値が変わるため更新：

| テスト | 変更 |
|-------|------|
| create 正常系 | `toBeNull()` → `toEqual({ lastResult: expect.objectContaining({ status: 'success' }) })` |
| create 空 title | `toBeNull()` → `lastResult` に `status: 'error'` が含まれることを確認 |
| toggle / delete / 不明 intent | `toBeNull()` → `toEqual({ lastResult: null })` |

### `app/features/todo/components/create-todo-form.test.tsx`

Conform が生成する DOM 構造に合わせてアサーションを調整。

---

## ファイル操作一覧

| 操作 | ファイル |
|------|---------|
| 新規 | `app/features/todo/schemas/create-todo-schema.ts` |
| 新規 | `app/features/auth/schemas/login-schema.ts` |
| 新規 | `app/features/auth/schemas/signup-schema.ts` |
| 修正 | `package.json` (dependencies 追加) |
| 修正 | `app/routes/todos.tsx` (action の create ケースと戻り値) |
| 修正 | `app/features/todo/components/create-todo-form.tsx` (Conform 化) |
| 修正 | `app/routes/login.tsx` (action 追加、useActionData) |
| 修正 | `app/features/auth/components/login-form.tsx` (Conform 化) |
| 修正 | `app/routes/signup.tsx` (action 追加、useActionData) |
| 修正 | `app/features/auth/components/signup-form.tsx` (Conform 化) |
| 修正 | `app/routes/todos.test.ts` (action 戻り値の更新) |
| 修正 | `app/features/todo/components/create-todo-form.test.tsx` (DOM アサーション調整) |

---

## 注意点

- `app/shared/auth/auth.client.ts` は削除しない（`todos.tsx` のサインアウトで使用）
- 認証 action で `asResponse: true` を使い、`Set-Cookie` ヘッダーを `redirect` に転送する
- サインアップの `submission.reply()` では `hideFields: ['password']` でパスワード漏洩を防ぐ

---

## 検証

```bash
npm run lint          # Biome チェック
npm run typecheck     # 型チェック
npm run test          # 全テスト pass
npm run dev           # 手動確認
```

手動確認項目：
- `/login` — 空送信でエラー表示、不正認証でサーバーエラー、正常ログインで `/todos` リダイレクト
- `/signup` — 空送信・不正値でエラー、パスワード8文字未満でエラー、正常サインアップ
- `/todos` — タイトル空でエラー表示、追加後にフォームリセット、toggle/delete は引き続き動作

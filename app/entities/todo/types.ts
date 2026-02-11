import type { InferSelectModel } from 'drizzle-orm';
import type { todo } from '../../../db/schema';

export type Todo = InferSelectModel<typeof todo>;

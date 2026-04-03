import { PgTransaction } from 'drizzle-orm/pg-core';

export type TxnClient<T extends Record<string, unknown>> = PgTransaction<
  any,
  T
>;

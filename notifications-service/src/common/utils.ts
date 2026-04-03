/**
 * Capitalizes words
 * @param word
 * @returns
 */
export function capitalize(word: string) {
  return word.split('')[0].toUpperCase() + word.split('').slice(1).join('');
}

export function generateErrorLogMessage(message: string, error: unknown) {
  return `${message} - "${(error as Error).message}"`;
}

/**
 * Checks whether error is a postgre error
 * @param err
 * @param postgreErrorCode
 * @returns
 */
export function isPostgreError(err: unknown, postgreErrorCode: string) {
  return Boolean(
    err &&
    typeof err === 'object' &&
    (err as Record<string, unknown>)['code'] === postgreErrorCode,
  );
}

/**
 * Generates pagination data
 * @param totalData
 * @param page
 * @returns
 */
export function generatePaginationData(totalData: number, page: number) {
  const limit = 10;
  const totalPages = Math.ceil(totalData / limit);
  const hasMorePage = page < totalPages;
  const nextPage = hasMorePage ? page + 1 : null;

  return { totalPages, hasMorePage, nextPage, limit };
}

/**
 * Generate cursor pagination data
 * @param rows
 * @param limit
 * @returns
 */
export function generateCursorPaginationData<T extends { id: number }>(
  rows: T[],
  limit = 10,
) {
  const hasMore = rows.length > limit;
  const data = hasMore ? rows.slice(0, -1) : rows;

  const nextCursor = hasMore ? data[data.length - 1].id : null;

  return { data, nextCursor, hasMore };
}

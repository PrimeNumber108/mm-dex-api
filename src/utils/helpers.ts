export const promiseLimit = async <T>(
  promises: Promise<T>[],
  limit: number = 20,
): Promise<T[]> => {
  const results: T[] = [];
  let index = 0;

  const processBatch = async () => {
    const currentBatch = promises.slice(index, index + limit);
    index += limit;

    const batchResults = await Promise.all(currentBatch);
    results.push(...batchResults);
  };

  while (index < promises.length) {
    await processBatch();
  }

  return results;
};

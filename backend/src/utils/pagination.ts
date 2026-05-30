export const getPagination = (pageRaw?: string, limitRaw?: string) => {
  const page = Math.max(Number(pageRaw ?? 1), 1);
  const limit = Math.min(Math.max(Number(limitRaw ?? 10), 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};

export const buildPagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;
  const sort = {};

  if (query.sort) {
    const order = query.order === 'asc' ? 1 : -1;
    sort[query.sort] = order;
  } else {
    sort.createdAt = -1;
  }

  return { page, limit, skip, sort };
};

export const paginateResult = (data, total, page, limit) => ({
  items: data,
  pagination: {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page * limit < total,
    hasPrevPage: page > 1,
  },
});

import { buildPagination, paginateResult } from '../../../src/utils/pagination.js';

describe('pagination', () => {
  describe('buildPagination', () => {
    it('should return defaults when no query params', () => {
      const result = buildPagination({});
      expect(result).toEqual({
        page: 1,
        limit: 10,
        skip: 0,
        sort: { createdAt: -1 },
      });
    });

    it('should parse page and limit from query', () => {
      const result = buildPagination({ page: '3', limit: '20' });
      expect(result.page).toBe(3);
      expect(result.limit).toBe(20);
      expect(result.skip).toBe(40);
    });

    it('should enforce minimum page of 1', () => {
      const result = buildPagination({ page: '-5' });
      expect(result.page).toBe(1);
    });

    it('should enforce minimum limit of 1', () => {
      const result = buildPagination({ limit: '0' });
      expect(result.limit).toBe(1);
    });

    it('should enforce maximum limit of 100', () => {
      const result = buildPagination({ limit: '500' });
      expect(result.limit).toBe(100);
    });

    it('should handle custom sort field with ascending order', () => {
      const result = buildPagination({ sort: 'title', order: 'asc' });
      expect(result.sort).toEqual({ title: 1 });
    });

    it('should handle custom sort field with descending order', () => {
      const result = buildPagination({ sort: 'rating', order: 'desc' });
      expect(result.sort).toEqual({ rating: -1 });
    });

    it('should default sort order to descending', () => {
      const result = buildPagination({ sort: 'distance' });
      expect(result.sort).toEqual({ distance: -1 });
    });
  });

  describe('paginateResult', () => {
    it('should build correct pagination metadata', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const result = paginateResult(data, 25, 2, 10);

      expect(result.items).toEqual(data);
      expect(result.pagination).toEqual({
        total: 25,
        page: 2,
        limit: 10,
        totalPages: 3,
        hasNextPage: true,
        hasPrevPage: true,
      });
    });

    it('should indicate no next page on last page', () => {
      const result = paginateResult([], 20, 2, 10);
      expect(result.pagination.hasNextPage).toBe(false);
    });

    it('should indicate no prev page on first page', () => {
      const result = paginateResult([], 20, 1, 10);
      expect(result.pagination.hasPrevPage).toBe(false);
    });

    it('should handle single page result', () => {
      const result = paginateResult([{ id: 1 }], 1, 1, 10);
      expect(result.pagination.totalPages).toBe(1);
      expect(result.pagination.hasNextPage).toBe(false);
      expect(result.pagination.hasPrevPage).toBe(false);
    });

    it('should handle empty result', () => {
      const result = paginateResult([], 0, 1, 10);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });
  });
});

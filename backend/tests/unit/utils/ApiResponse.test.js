import { jest } from '@jest/globals';
import ApiResponse from '../../../src/utils/ApiResponse.js';

describe('ApiResponse', () => {
  let res;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  describe('success', () => {
    it('should return 200 with data and default message', () => {
      ApiResponse.success(res, { user: { id: 1 } });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Success',
        data: { user: { id: 1 } },
      });
    });

    it('should return custom message and status code', () => {
      ApiResponse.success(res, null, 'Done', 202);
      expect(res.status).toHaveBeenCalledWith(202);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Done',
        data: null,
      });
    });
  });

  describe('created', () => {
    it('should return 201 with data', () => {
      ApiResponse.created(res, { route: { id: 1 } }, 'Route created');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Route created',
        data: { route: { id: 1 } },
      });
    });

    it('should use default message', () => {
      ApiResponse.created(res, null);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Created successfully',
        data: null,
      });
    });
  });

  describe('noContent', () => {
    it('should return 204 with no body', () => {
      ApiResponse.noContent(res);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  });
});

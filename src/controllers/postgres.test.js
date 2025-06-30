import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock pg before importing it - Vitest has stable mocking
const mockPool = {
  on: vi.fn(),
  connect: vi.fn(),
};

const mockPgClient = {
  on: vi.fn(),
  connect: vi.fn(),
};

vi.mock('pg', () => ({
  default: {
    Pool: vi.fn(() => mockPool),
  },
}));

// Import pg after mocking
import pg from 'pg';

describe('featuresController', () => {
  describe('database connection', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should handle PostgreSQL errors', async () => {
      // Import the module to trigger the Pool creation
      await import('./featuresController.js');
      
      // The Pool should have been called during module load
      expect(pg.Pool).toHaveBeenCalled();
      
      // Verify that error handler was set up
      expect(mockPool.on).toHaveBeenCalledWith('error', expect.any(Function));
      
      // Test the error handler
      const errorHandler = mockPool.on.mock.calls.find(call => call[0] === 'error')[1];
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
      
      errorHandler(new Error('connection error'));
      
      expect(consoleSpy).toHaveBeenCalledWith('Unexpected error on idle client', expect.any(Error));
      expect(exitSpy).toHaveBeenCalledWith(-1);
      
      consoleSpy.mockRestore();
      exitSpy.mockRestore();
    });
  });
});

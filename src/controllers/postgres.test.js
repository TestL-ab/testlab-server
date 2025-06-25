import pg from 'pg';

jest.mock('pg', () => {
  const mPgClient = {
    on: jest.fn(),
    connect: jest.fn(),
  };
  const mPgPool = {
    connect: jest.fn(() => mPgClient),
    on: jest.fn(),
  };
  return {
    default: {
      Pool: jest.fn(() => mPgPool),
    },
    Pool: jest.fn(() => mPgPool),
  };
});

describe('featuresController', () => {
  describe('database connection', () => {
    it('should handle PostgreSQL errors', async () => {
      // Dynamically import the module to trigger the Pool creation
      await import('./featuresController.js');
      
      // The Pool should have been called during module load
      expect(pg.Pool).toHaveBeenCalled();
      
      // Get the pool instance
      const poolInstance = pg.Pool.mock.results[0].value;
      expect(poolInstance.on).toHaveBeenCalledWith('error', expect.any(Function));
      
      // Test the error handler
      const errorHandler = poolInstance.on.mock.calls[0][1];
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
      
      errorHandler(new Error('connection error'));
      
      expect(consoleSpy).toHaveBeenCalledWith('Unexpected error on idle client', expect.any(Error));
      expect(exitSpy).toHaveBeenCalledWith(-1);
      
      consoleSpy.mockRestore();
      exitSpy.mockRestore();
    });
  });
});

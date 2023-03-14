const pg = require('pg');
const featuresController = require('./featuresController');

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
    Pool: jest.fn(() => mPgPool),
  };
});

describe('featuresController', () => {
  describe('database connection', () => {
    it('should handle PostgreSQL errors', () => {
      const pgClient = new pg.Pool();
      expect(pg.Pool).toHaveBeenCalledWith({ database: 'TestLab' });
      expect(pgClient.on).toHaveBeenCalledWith('error', expect.any(Function));
      const errorHandler = pgClient.on.mock.calls[0][1];
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
      errorHandler(new Error('connection error'));
      expect(consoleSpy).toHaveBeenCalledWith('Unexpected error on idle client', expect.any(Error));
      expect(exitSpy).toHaveBeenCalledWith(-1);
    });
  });
});

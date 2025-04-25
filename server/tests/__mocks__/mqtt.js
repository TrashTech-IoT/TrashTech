module.exports = {
    connect: jest.fn(() => {
      return {
        on: jest.fn(),
        end: jest.fn(),
        publish: jest.fn(),
        subscribe: jest.fn(),
      };
    }),
  };
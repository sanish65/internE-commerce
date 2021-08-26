module.exports = {
  coveragePathIgnorePatterns: [
    '/node_modules/'
  ],
  testEnvironment: 'node',
  testRegex: '((\\.|/*.)(specs))\\.js?$',
  verbose: true,
  testTimeout: 30000
};

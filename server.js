const chalk = require('chalk');
const app = require('./app');

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`${chalk.green('✓')} App is running at http://localhost:${PORT} in ${app.get('env')} mode`);
  console.log('  Press CTRL-C to stop\n');
});

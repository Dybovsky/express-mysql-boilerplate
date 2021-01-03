const app = require('./app');

const port = process.env.PORT || 5000;
const host = '0.0.0.0';
app.listen(port, host, () => {
  console.log(`Listening on ${host}:${port}`);
});
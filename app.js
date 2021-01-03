const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const AJV = require('ajv').default;
const { migrate } = require('./lib/mysql');
const indexRouter = require('./routes/index');
const productsRouter = require('./routes/products');
const usersRouter = require('./routes/users');
require('dotenv').config();

const app = express();
migrate().then(console.log).catch(console.error);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
  req.validate = (schema) => {
    const ajv = new AJV({ allErrors: true });
    const validate = ajv.compile(schema.valueOf());
    const valid = validate(req.body);
    if (!valid) {
      res.status(403).send({ errors: validate.errors });
      return false;
    }
    return true;
  }
  next();
});

app.use('/', indexRouter);
app.use('/products', productsRouter);
app.use('/users', usersRouter);

module.exports = app;
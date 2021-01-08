const router = require('express').Router();
const S = require('fluent-json-schema');
const { createUser, authenticateUser } = require('../lib/queries/users');
const jwt = require('jsonwebtoken');

router.use(function (req, res, next) {
  req.authenticateToken = function () {
    const token = req.headers.authorization.replace('Bearer ', '');
    return new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          res.status(401).send({ message });
          reject();
        }
        resolve(decoded);
      });
    });
  }
  next();
});

const EmailPasswordSchema = S.object()
  .prop('email', S.string().required())
  .prop('password', S.string().minLength(6).required());

router.post('/', async (req, res) => {
  if (req.validate(EmailPasswordSchema)) {
    try {
      const { email, password } = req.body;
      const id = await createUser(email, password);
      res.send({ id });
    } catch (e) {
      console.error(e);
      res.status(500).send({ message: 'Internal server error' });
    }
  }
});

router.post('/login', async (req, res) => {
  if (req.validate(EmailPasswordSchema)) {
    try {
      const user = await authenticateUser(req.body.email, req.body.password);
      if (user) {
        const token = jwt.sign({ email: user.email, id: user.id }, process.env.JWT_SECRET);
        res.send({ token });
      } else {
        res.status(403).send({ message: 'Bad email or password' });
      }
    } catch (e) {
      console.error(e);
      res.status(500).send({ message: 'Internal server error' });
    }
  }
});

module.exports = router;
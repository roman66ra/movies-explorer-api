const { celebrate, Joi } = require('celebrate');
const router = require('express').Router();
const { login, postUser } = require('../controllers/user');
const auth = require('../middlewares/auth');
const NotFoundError = require('../errors/NotFoundError');

router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().pattern(/^[^ ]+@[^ ]+\.[a-z]{2,3}$/),
    password: Joi.string().required().min(2),
  }),
}), login);

router.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    email: Joi.string().required().pattern(/^[^ ]+@[^ ]+\.[a-z]{2,3}$/),
    password: Joi.string().required().min(2),
  }),
}), postUser);

router.use('/', auth, require('./user'));
router.use('/', auth, require('./movie'));

router.use((req, res, next) => {
  next(new NotFoundError('Страница не найдена'));
});

module.exports = router;

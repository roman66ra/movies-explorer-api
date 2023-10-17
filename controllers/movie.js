const httpConstants = require('http2').constants;
const { default: mongoose } = require('mongoose');
const Movie = require('../models/movie');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');

module.exports.getMovies = (req, res, next) => {
  Movie.find({})
    .then((movie) => {
      if
      (movie.owner === req.user._id) { res.status(httpConstants.HTTP_STATUS_OK).send(movie); }
    })
    .catch(next);
};

module.exports.createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
    owner: req.user._id,
  })
    .then((movie) => {
      Movie.findById(movie._id);
      res.status(httpConstants.HTTP_STATUS_CREATED).send(movie);
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.DocumentNotFoundError) {
        next(new NotFoundError('Сохранённый фильм с введенным ID не найден'));
      } if (error instanceof mongoose.Error.ValidationError) {
        next(new BadRequestError(error.message));
      } else {
        next(error);
      }
    });
};

module.exports.deleteMovie = (req, res, next) => {
  Movie.findById(req.params.movieId)
    .orFail()
    .then((movie) => {
      if (!movie.owner.equals(req.user._id)) {
        throw new ForbiddenError('Вы не являетесь владельцем сохраненного фильма');
      }
      Movie.deleteOne(movie)
        .orFail()
        .then(() => res.status(httpConstants.HTTP_STATUS_OK).send({ message: 'Сохраненный фильм удален' }))
        .catch((error) => {
          if (error instanceof mongoose.Error.CastError) {
            next(new BadRequestError('Переданы некорректные данные для удаления сохраненного фильма.'));
          } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
            next(new NotFoundError('Сохраненный фильм с введенным ID не найдена'));
          } else {
            next(error);
          }
        });
    })
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        next(new NotFoundError('Сохраненный фильм с указанным id не найден'));
      } else {
        next(err);
      }
    });
};

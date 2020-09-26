const morgan = require('morgan');

morgan.token('post-data-object', (req) => JSON.stringify(req.body));

const requestLogger = morgan(':method :url :status :res[content-length] - :response-time ms :post-data-object');

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  }

  if (error.name === 'ValidationError') {
    return response.status(422).json({ error: error.message });
  }

  next(error);

  return null;
};

module.exports = {
  unknownEndpoint, errorHandler, requestLogger,
};

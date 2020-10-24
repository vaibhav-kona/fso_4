const express = require('express');

const app = express();
require('express-async-errors');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./utils/config');
const logger = require('./utils/logger');
const middleware = require('./utils/middleware');
const blogsRouter = require('./controllers/blogs');
const usersRouter = require('./controllers/users');

// DB server connection
mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
}).then(() => {
  logger.info('Connected to MongoDB');
});

// Setup
app.use(cors());
app.use(express.json());
app.use(middleware.requestLogger);

// Routes
app.use('/api/blogs', blogsRouter);
app.use('/api/users', usersRouter);

// Middleware
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;

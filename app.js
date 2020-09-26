const express = require('express');
const app = express();
const cors = require('cors');
const config = require('./utils/config');
const mongoose = require('mongoose');
const logger = require('./utils/logger');
const middleware = require('./utils/middleware');
const blogsRouter = require('./controllers/blogs');

// DB server connection
mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true, useUnifiedTopology: true,
  useFindAndModify: false, useCreateIndex: true
}).then(() => {
  logger.info("Connected to MongoDB")
})

// Setup
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/blogs', blogsRouter);

// Middleware
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');

usersRouter.get('/', async (req, res) => {
  const users = await User.find({});
  return res.json(users);
});

usersRouter.post('/', async (req, res) => {
  const reqBody = req.body;

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(reqBody.password, saltRounds);

  const user = new User({
    name: reqBody.name,
    username: reqBody.username,
    passwordHash,
  });

  const savedUser = await user.save();

  res.json(savedUser);
});

module.exports = usersRouter;

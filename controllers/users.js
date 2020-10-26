const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');

const validatePassword = (request, response) => {
  const { password } = request.body;
  if (password) {
    if (password.length < 3) {
      response.status(422).json({ error: 'password should be atleast 3 characters' });
    }
  } else {
    response.status(422).json({ error: 'password should not be empty' });
  }
};

usersRouter.get('/', async (req, res) => {
  const users = await User.find({}).populate('blogs', { user: 0 });
  return res.json(users);
});

usersRouter.post('/', async (req, res) => {
  const reqBody = req.body;

  validatePassword(req, res);

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

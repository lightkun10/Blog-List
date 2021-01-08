const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');
const { checkInput } = require('../utils/checkInput');

usersRouter.get('/', async (request, response) => {
  const users = await User
    // .find({}).populate('blogs');
    .find({}).populate('blogs', { url: 1, title: 1, author: 1 });

  response.json(users);
});

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body;

  // Check the length of password and username
  const malformed = checkInput(username, password);

  if (!password) {
    return response.status(400).json({ error: 'Password must be provided' });
  }

  if (malformed) {
    return response
      .status(400)
      .json({ error: `${malformed} must be at least 3 characters long.` });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash,
  });

  const savedUser = await user.save();

  response.json(savedUser);
});

module.exports = usersRouter;

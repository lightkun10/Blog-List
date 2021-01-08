/* eslint-disable no-underscore-dangle */
/* eslint-disable consistent-return */
/**
 * Router handling for blogs.
 */
const blogsRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const Blog = require('../models/blog');
const User = require('../models/user');

/** SECTION: Fetching all blogs from database */
blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({}).populate('user', { username: 1, name: 1 });

  response.json(blogs);
});

// This function isolates the token
// from the authorization header.
const getTokenFrom = (request) => {
  const authorization = request.get('authorization');
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7);
  }
  return null;
};

/** SECTION: Adding a new blog to the database */
blogsRouter.post('/', async (request, response) => {
  const { body } = request;
  // If no title and url provided, response with
  // status 404 and early finish this operation.
  if (!body.title && !body.url) {
    return response.status(400).json({ error: 'missing url or title' });
  }

  const token = getTokenFrom(request);
  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!token || !decodedToken.id) {
    // 401 Unauthorized
    // https://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html#sec10.4.2
    return response.status(401).json({ error: 'token missing or invalid' });
  }
  const user = await User.findById(decodedToken.id);

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user._id,
  });

  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();

  response.status(201).json(savedBlog);
});

/** SECTION: Deleting a blog from database */
blogsRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndRemove(request.params.id);
  response.status(204).end();
});

/** SECTION: Updating a blog likes from database */
blogsRouter.put('/:id', async (request, response) => {
  const { likes } = request.body;

  const blog = {
    likes,
  };

  const savedBlog = await Blog
    .findByIdAndUpdate(request.params.id, blog, { new: true });
  response.json(savedBlog.toJSON());
});

module.exports = blogsRouter;

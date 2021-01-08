/* eslint-disable no-underscore-dangle */
/* eslint-disable consistent-return */
/**
 * Router handling for blogs.
 */
const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');

/** SECTION: Fetching all blogs from database */
blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({}).populate('user', { username: 1, name: 1 });

  response.json(blogs);
});

/** SECTION: Adding a new blog to the database */
blogsRouter.post('/', async (request, response) => {
  const { body } = request;

  // If no title and url provided, response with
  // status 404 and early finish this operation.
  if (!body.title && !body.url) {
    return response.status(400).json({ error: 'missing url or title' });
  }

  const user = await User.findById(body.userId);

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

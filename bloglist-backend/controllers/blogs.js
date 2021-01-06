/* eslint-disable consistent-return */
/**
 * Router handling for blogs.
 */
const blogsRouter = require('express').Router();
const Blog = require('../models/blog');

/** SECTION: Fetching all blogs from database */
blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({});
  response.json(blogs);
});

blogsRouter.post('/', async (request, response) => {
  const { body } = request;

  if (!body.title && !body.url) {
    return response.status(400).json({ error: 'missing url or title' });
  }

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
  });

  const savedBlog = await blog.save();
  response.json(savedBlog);
});

module.exports = blogsRouter;

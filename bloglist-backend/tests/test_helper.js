/* eslint-disable no-underscore-dangle */
const Blog = require('../models/blog');

const initialBlogs = [
  {
    title: 'React v17.0',
    author: 'Dan Abramov',
    url: 'https://reactjs.org/blog/2020/10/20/react-v17.html',
    likes: 0,
  },
  {
    title: 'Introducing Zero-Bundle-Size React Server Components',
    author: 'Dan Abramov, Lauren Tan, Joseph Savona, Sebastian Markbåge',
    url: 'https://reactjs.org/blog/2020/12/21/data-fetching-with-react-server-components.html',
    likes: 0,
  },
];

const nonExistingId = async () => {
  const blog = new Blog({
    title: 'for_testing',
    author: 'test',
    url: 'test',
    likes: 0,
  });
  await blog.save();
  await blog.remove();

  return blog._id.toString();
};

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map((blog) => blog.toJSON());
};

module.exports = {
  initialBlogs,
  nonExistingId,
  blogsInDb,
};

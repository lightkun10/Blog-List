/* eslint-disable no-underscore-dangle */
require('../utils/config');
const Blog = require('../models/blog');
const User = require('../models/user');
const initialBlogs = require('./blogs_for_tests');
const initialUsers = require('./users_for_tests');

// Take all blogs and assign to the test user
const blogIds = initialBlogs.blogs.map((blog) => blog._id);

// Sign a member with its respective blogs
const testUser1 = { ...initialUsers.users[0], blogs: blogIds.slice(0, 3) };
const testUser2 = { ...initialUsers.users[1], blogs: blogIds.slice(3) };

const test1Blogs = initialBlogs.blogs
  .slice(0, 3).map((blog) => ({ ...blog, user: initialUsers.users[0]._id }));
const test2Blogs = initialBlogs.blogs
  .slice(3).map((blog) => ({ ...blog, user: initialUsers.users[1]._id }));

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map((blog) => blog.toJSON());
};

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((user) => user.toJSON());
};

const beforeBlogsUsers = async () => {
  await User.deleteMany({});
  await Blog.deleteMany({});
  await User.insertMany([testUser1, testUser2]);
  await Blog.insertMany([...test1Blogs, ...test2Blogs]);
};

module.exports = {
  initialBlogs,
  initialUsers: [testUser1, testUser2],
  blogsInDb,
  usersInDb,
  beforeBlogsUsers,
};

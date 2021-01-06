const mongoose = require('mongoose');
const supertest = require('supertest');
const helper = require('./test_helper');
const app = require('../app');
const Blog = require('../models/blog');

const api = supertest(app);

/* SECTION Initialize database before every test. */
beforeEach(async () => {
  await Blog.deleteMany({});

  const blogObjects = helper.initialBlogs
    .map((blog) => new Blog(blog));
  const promiseArray = blogObjects.map((blog) => blog.save());
  await Promise.all(promiseArray);
});

test('blogs returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/);
});

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs');

  expect(response.body).toHaveLength(helper.initialBlogs.length);
});

test('a specific blog is within the returned blogs', async () => {
  const response = await api.get('/api/blogs');

  const contents = response.body.map((r) => r.title);
  expect(contents).toContainEqual(
    'Introducing Zero-Bundle-Size React Server Components',
  );
});

test('unique identifier property is named id', async () => {
  const response = await api.get('/api/blogs');

  const contents = response.body.map((r) => r.id);
  expect(contents).toBeDefined();
});

afterAll(() => {
  mongoose.connection.close();
});

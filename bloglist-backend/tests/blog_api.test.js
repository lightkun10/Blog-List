/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose');
const supertest = require('supertest');
const jwt = require('jsonwebtoken');
const helper = require('./test_helper');
const app = require('../app');
const Blog = require('../models/blog');
const initialBlogs = require('./blogs_for_tests');

const api = supertest(app);

/* SECTION Initialize database before every test. */
beforeEach(async () => {
  await helper.beforeBlogsUsers();
});

describe('When there is some initial blogs saved', () => {
  test('blogs returned as json', async () => { // DONE
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('all blogs are returned', async () => { // DONE
    const response = await api.get('/api/blogs');

    expect(response.body).toHaveLength(initialBlogs.blogs.length);
  });

  test('a specific blog is within the returned blogs', async () => { // DONE
    const response = await api.get('/api/blogs');

    const titles = response.body.map((r) => r.title);
    expect(titles).toContainEqual(
      'How BioWare\'s Anthem Went Wrong',
    );
  });

  test('unique identifier properties is named id', async () => { // DONE
    const response = await api.get('/api/blogs');

    const ids = response.body.map((r) => r.id);

    ids.forEach((id) => expect(id).toBeDefined());
  });
});

describe('Addition of a new blog', () => {
  test('a registered user succeeds with valid data', async () => { // DONE
    const test1Token = jwt.sign({
      username: helper.initialUsers[0].username,
      id: helper.initialUsers[0]._id,
    }, process.env.SECRET);

    const newBlog = {
      title: 'test new blog',
      author: 'pandu',
      url: 'test',
      likes: 0,
    };

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${test1Token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(initialBlogs.blogs.length + 1);

    // Ensure that the content of the blog post
    // is saved correctly to the database.
    const titles = blogsAtEnd.map((blog) => blog.title);
    expect(titles).toContain(
      'test new blog',
    );
  });

  test('non registered user failed', async () => {
    const newBlog = {
      title: 'test new blog',
      author: 'pandu',
      url: 'test',
      likes: 0,
    };

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
      .expect('Content-Type', /application\/json/);
  });

  test('likes property is not missing', async () => { // DONE
    const test1Token = jwt.sign({
      username: helper.initialUsers[0].username,
      id: helper.initialUsers[0]._id,
    }, process.env.SECRET);

    const newBlog = {
      title: 'testtitle',
      author: 'testauthor',
      url: 'testurl',
    };

    let res = null;
    res = await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${test1Token}`)
      .send(newBlog)
      .expect(201);

    expect(res.body.likes).toBe(0);
  });

  test('fails with status code 400 if title and url is invalid', async () => {
    const test1Token = jwt.sign({
      username: helper.initialUsers[0].username,
      id: helper.initialUsers[0]._id,
    }, process.env.SECRET);

    const newBlog = {
      author: 'test',
      likes: 0,
    };

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${test1Token}`)
      .send(newBlog)
      .expect(400);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(initialBlogs.blogs.length);
  });
});

describe('Deletion of a blog', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const test1Token = jwt.sign({
      username: helper.initialUsers[0].username,
      id: helper.initialUsers[0]._id,
    }, process.env.SECRET);

    const blogsAtStart = await helper.blogsInDb();
    const blogToDelete = blogsAtStart[0];

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `bearer ${test1Token}`)
      .expect(204);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(
      initialBlogs.blogs.length - 1,
    );

    const titles = blogsAtEnd.map((blog) => blog.title);

    expect(titles).not.toContain(blogToDelete.title);
  });

  test('failed with status code 401 if not the owner', async () => {
    const test2Token = jwt.sign({
      username: helper.initialUsers[1].username,
      id: helper.initialUsers[1]._id,
    }, process.env.SECRET);

    const blogsAtStart = await helper.blogsInDb();
    const blogToDelete = blogsAtStart[0];

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('authorization', `bearer ${test2Token}`)
      .expect(401);
  });

  test('failed with status code 401 if invalid token', async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToDelete = blogsAtStart[0];

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', 'bearer false token')
      .expect(401);
  });

  test('failed with status code 401 if no token', async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToDelete = blogsAtStart[0];

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(401);
  });
});

describe('Updates of a blog', () => {
  test('returns 200 on updated likes', async () => {
    const test1Token = jwt.sign({
      username: helper.initialUsers[0].username,
      id: helper.initialUsers[0]._id,
    }, process.env.SECRET);

    const blogsAtStart = await helper.blogsInDb();
    const blogToUpdate = blogsAtStart[0];

    const updateLikes = {
      likes: blogToUpdate.likes + 1,
    };

    const result = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .set('Authorization', `bearer ${test1Token}`)
      .send(updateLikes)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const blogs = await helper.blogsInDb();
    expect(blogs).toHaveLength(blogsAtStart.length);
    const updated = blogs.find((blog) => blog.id === result.body.id);
    expect(updated).toBeDefined();
  });
});

afterAll(() => {
  mongoose.connection.close();
});

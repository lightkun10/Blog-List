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

describe('When there is some initial notes saved', () => {
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

    const titles = response.body.map((r) => r.title);
    expect(titles).toContainEqual(
      'Introducing Zero-Bundle-Size React Server Components',
    );
  });

  test('unique identifier properties is named id', async () => {
    const response = await api.get('/api/blogs');

    const ids = response.body.map((r) => r.id);

    ids.forEach((id) => expect(id).toBeDefined());
  });
});

describe('Addition of a new note', () => {
  test('succeeds with valid data', async () => {
    const newBlog = {
      title: 'test new blog',
      author: 'pandu',
      url: 'test',
      likes: 0,
    };

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);

    // Ensure that the content of the blog post
    // is saved correctly to the database.
    const titles = blogsAtEnd.map((blog) => blog.title);
    expect(titles).toContain(
      'test new blog',
    );
  });

  test('likes property is not missing', async () => {
    const newBlog = {
      title: 'testtitle',
      author: 'testauthor',
      url: 'testurl',
    };

    let res = null;
    res = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201);

    expect(res.body.likes).toBe(0);
  });

  test('fails with status code 400 if title and url is invalid', async () => {
    const newBlog = {
      author: 'test',
      likes: 0,
    };

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
  });
});

describe('Deletion of a blog', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToDelete = blogsAtStart[0];

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length - 1,
    );

    const titles = blogsAtEnd.map((blog) => blog.title);

    expect(titles).not.toContain(blogToDelete.title);
  });
});

describe('Updates of a blog', () => {
  test('returns 200 on updated likes', async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToUpdate = blogsAtStart[0];

    const updateLikes = {
      likes: blogToUpdate.likes + 1,
    };

    const result = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
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

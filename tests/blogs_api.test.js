const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Blog = require('../models/blog');
const helper = require('./test_helper');

beforeEach(async () => {
  await Blog.deleteMany({});
  let blogObj = new Blog(helper.initialBlogs[0]);
  await blogObj.save();
  blogObj = new Blog(helper.initialBlogs[1]);
  await blogObj.save();
});

const api = supertest(app);

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/);
});

test('there are blogs', async () => {
  const response = await api.get('/api/blogs');

  expect(response.body).toHaveLength(helper.initialBlogs.length);
});

test('the first blog is about hello world', async () => {
  const response = await api.get('/api/blogs');

  expect(response.body[0].title).toBe(helper.initialBlogs[0].title);
});

test('a valid blog can be added', async () => {
  const newBlog = {
    title: 'React blog',
    author: 'Rajesh',
    url: '/react-blog',
    likes: 7,
  };

  const savedBlog = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const response = await helper.blogsInDb();

  const titles = response.map((r) => r.title);

  expect(titles).toHaveLength(helper.initialBlogs.length + 1);
  expect(savedBlog.body).toEqual(expect.objectContaining(newBlog));
});

test('blog created without any likes should be given zero by default', async () => {
  const newBlog = {
    title: 'React blog',
    author: 'Rajesh',
    url: '/react-blog',
  };

  const savedBlog = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  expect(savedBlog.body.likes).toBe(0);
});

test('blog without title cannot be saved', async () => {
  const newBlog = {
    author: 'Rajesh',
    url: '/react-blog',
    likes: 7,
  };

  await api.post('/api/blogs').send(newBlog).expect(422);

  const blogs = await helper.blogsInDb();
  expect(blogs).toHaveLength(helper.initialBlogs.length);
});

test('blog has uid as "id" instead of "_id"', async () => {
  const blogs = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/);
  const firstBlogFromDb = blogs.body[0];
  expect(firstBlogFromDb.id).toBeDefined();
});

test('a specific blog to be viewed', async () => {
  const blogsAtStart = await helper.blogsInDb();
  const blogToBeViewed = blogsAtStart[0];

  const resultBlog = await api
    .get(`/api/blogs/${blogToBeViewed.id}`)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  const processedBlogToView = JSON.parse(JSON.stringify(blogToBeViewed));
  expect(resultBlog.body).toEqual(processedBlogToView);
});

test('a blog can be deleted', async () => {
  // Get all blogs in the db at start
  const blogsAtStart = await helper.blogsInDb();

  // Delete certain blog
  const blogToBDeleted = blogsAtStart[0];
  await api.delete(`/api/blogs/${blogToBDeleted.id}`)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  // Get all blogs now.
  const blogsAfterDeletion = await helper.blogsInDb();
  expect(blogsAfterDeletion.length).toBe(blogsAtStart.length - 1);
  // Total blogs must be 1 less and the blog that was deleted should not be present.
});

afterAll(() => {
  mongoose.connection.close();
});

const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Blog = require('../models/blog');

const initialBlogs = [
  {
    title: 'Hello world!', author: 'Sridevi', url: '/hello-world', likes: 4,
  },
  {
    title: 'Node is awesome', author: 'Rakesh', url: '/node-is-awesome', likes: 3,
  },
];

beforeEach(async () => {
  await Blog.deleteMany({});
  let blogObj = new Blog(initialBlogs[0]);
  await blogObj.save();
  blogObj = new Blog(initialBlogs[1]);
  await blogObj.save();
});

const api = supertest(app);

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/);
});

// test('there are blogs', async () => {
//   const response = await api.get('/api/blogs');

//   expect(response.body).toHaveLength(2);
// });

// test('the first note is about intro to programming', async () => {
//   const response = await api.get('/api/blogs');

//   expect(response.body[0].title).toBe('Hello world!');
// });

afterAll(() => {
  mongoose.connection.close();
});

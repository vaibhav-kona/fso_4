const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Blog = require('../models/blog');
const User = require('../models/user');
const helper = require('./test_helper');

let token = '';
let loggedInUserId = '';

const api = supertest(app);

beforeAll(async () => {
  await User.deleteMany({});

  const usersAtStart = await helper.usersInDb();
  const indexOfRoot = usersAtStart.findIndex((user) => user.username === 'root1');

  if (indexOfRoot !== -1) {
    loggedInUserId = usersAtStart[indexOfRoot].id;
  } else {
    const savedUserResponse = await api
      .post('/api/users')
      .send({ username: 'root1', password: 'helloworld', name: 'root' });

    loggedInUserId = savedUserResponse.body.id;
  }

  const loginResponse = await api
    .post('/api/login')
    .send({ username: 'root1', password: 'helloworld' });

  token = loginResponse.body.token;
});

beforeEach(async () => {
  await Blog.deleteMany({});

  const blogObjects = helper.initialBlogs.map((blog) => new Blog(blog));
  const promiseArray = blogObjects.map((boj) => boj.save());
  await Promise.all(promiseArray);
});

describe('when there are initially some blogs saved', () => {
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

  test('blog has uid as "id" instead of "_id"', async () => {
    const blogs = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/);
    const firstBlogFromDb = blogs.body[0];
    expect(firstBlogFromDb.id).toBeDefined();
  });
});

describe('viewing a specific blog', () => {
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
});

describe('addition of new blog', () => {
  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'React blog',
      author: 'Rajesh',
      url: '/react-blog',
      likes: 7,
      userId: loggedInUserId,
    };

    const expectedBlog = {
      title: 'React blog',
      author: 'Rajesh',
      url: '/react-blog',
      likes: 7,
      user: loggedInUserId,
    };

    const savedBlog = await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const response = await helper.blogsInDb();

    const titles = response.map((r) => r.title);

    expect(titles).toHaveLength(helper.initialBlogs.length + 1);
    expect(savedBlog.body).toEqual(expect.objectContaining(expectedBlog));
  });

  test('blog created without any likes should be given zero by default', async () => {
    const newBlog = {
      title: 'React blog',
      author: 'Rajesh',
      url: '/react-blog',
      userId: loggedInUserId,
    };

    const savedBlog = await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
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
      userId: loggedInUserId,
    };

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(422);

    const blogs = await helper.blogsInDb();
    expect(blogs).toHaveLength(helper.initialBlogs.length);
  });

  test('blog without url cannot be saved', async () => {
    const users = await helper.usersInDb();
    const newBlog = {
      title: 'React Blog',
      author: 'Rajesh',
      likes: 7,
      userId: users[0].id,
    };

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(422);
  });
});

describe('deletion of blog', () => {
  test('a blog cannot be deleted by unauthenticated user', async () => {
    // Get all blogs in the db at start
    const blogsAtStart = await helper.blogsInDb();

    // Delete certain blog
    const blogToBDeleted = blogsAtStart[0];
    await api
      .delete(`/api/blogs/${blogToBDeleted.id}`)
      .expect(401);
  });

  test('a blog cannot be deleted by user other than the one created', async () => {
    // Get all blogs in the db at start
    const blogsAtStart = await helper.blogsInDb();

    // Delete certain blog
    const blogToBDeleted = blogsAtStart[0];
    await api
      .delete(`/api/blogs/${blogToBDeleted.id}`)
      .set('Authorization', `bearer ${token}`)
      .expect(403);
  });

  test('a blog can be deleted by the one who created it', async () => {
    // Create a user
    const usersAtStart = await helper.usersInDb();
    const blogAuthorIndex = usersAtStart.findIndex((user) => user.username === 'blogauthor');

    let blogAuthor = null;
    if (blogAuthorIndex === -1) {
      const userCreationResponse = await api.post('/api/users').send({
        username: 'blogauthor',
        name: 'Blog Author',
        password: 'blogauthor',
      });
      blogAuthor = userCreationResponse.body;
    } else {
      blogAuthor = usersAtStart[blogAuthorIndex];
    }

    // Login with the user
    const userLoginResponse = await api.post('/api/login').send({
      username: 'blogauthor',
      password: 'blogauthor',
    });

    // Create a blog
    const newBlog = {
      title: 'Learn Node',
      author: 'Jagan',
      likes: 2,
      url: '/node-is-powerful',
      userId: blogAuthor.id,
    };

    const newBlogResponse = await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(201);

    // Get all blogs in the db after adding new blog
    const blogsAtStart = await helper.blogsInDb();

    // Delete certain blog
    const blogToBDeleted = newBlogResponse.body;

    console.log('blogToBDeleted : ', blogToBDeleted);
    console.log('blogAuthor : ', blogAuthor);

    const loginTokenForBlogAuthor = userLoginResponse.body.token;

    await api
      .delete(`/api/blogs/${blogToBDeleted.id}`)
      .set('Authorization', `bearer ${loginTokenForBlogAuthor}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    // Get all blogs now.
    const blogsAfterDeletion = await helper.blogsInDb();
    expect(blogsAfterDeletion.length).toBe(blogsAtStart.length - 1);
    // Total blogs must be 1 less and the blog that was deleted should not be present.
  });
});

describe('updating a specific blog', () => {
  test('update likes for a blog', async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToBeUpdated = blogsAtStart[0];

    const updatedBlog = await api
      .put(`/api/blogs/${blogToBeUpdated.id}`)
      .send({ likes: 10 })
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(updatedBlog.body.likes).toBe(10);
  });
});

afterAll(() => {
  mongoose.connection.close();
});

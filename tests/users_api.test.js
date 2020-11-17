const bcrypt = require('bcrypt');
const supertest = require('supertest');
const app = require('../app');
const User = require('../models/user');
const helper = require('./test_helper');

const api = supertest(app);

describe('When there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash('sekret', 10);
    const user = new User({ username: 'root', passwordHash });

    await user.save();
  });

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    console.log('usersAtEnd : ', usersAtEnd);

    const usernames = usersAtEnd.map((u) => u.username);
    expect(usernames).toContain(newUser.username);
  });

  test('creation fails with proper statuscode and message if username already exists', async () => {
    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(422)
      .expect('Content-type', /application\/json/);

    expect(result.body.error).toContain('`username` to be unique');
  });

  test('should fail if username is not 3 characters in length', async () => {
    const newUser = {
      name: 'chi',
      username: 'ch',
      password: 'salainen',
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(422)
      .expect('Content-type', /application\/json/);

    expect(result.body.error).toContain('User validation failed: username: Path `username` (`ch`) is shorter than the minimum allowed length (3).');
  });

  test('should fail if username is empty', async () => {
    const newUser = {
      name: 'chi',
      password: 'abc',
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(422)
      .expect('Content-type', /application\/json/);

    expect(result.body.error).toContain('User validation failed: username: Path `username` is required.');
  });

  test('should fail if password is empty', async () => {
    const newUser = {
      name: 'chi',
      username: 'ch',
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(422)
      .expect('Content-type', /application\/json/);

    expect(result.body.error).toContain('password should not be empty');
  });

  test('should fail if password is less than 3 characters', async () => {
    const newUser = {
      name: 'chi',
      username: 'ch',
      password: 'ab',
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(422)
      .expect('Content-type', /application\/json/);

    expect(result.body.error).toContain('password should be atleast 3 characters');
  });
});

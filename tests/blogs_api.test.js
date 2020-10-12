const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const Blog = require("../models/blog");
const helper = require("./test_helper");

beforeEach(async () => {
  await Blog.deleteMany({});
  let blogObj = new Blog(helper.initialBlogs[0]);
  await blogObj.save();
  blogObj = new Blog(helper.initialBlogs[1]);
  await blogObj.save();
});

const api = supertest(app);

test("blogs are returned as json", async () => {
  await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("there are blogs", async () => {
  const response = await api.get("/api/blogs");

  expect(response.body).toHaveLength(helper.initialBlogs.length);
});

test("the first blog is about hello world", async () => {
  const response = await api.get("/api/blogs");

  expect(response.body[0].title).toBe(helper.initialBlogs[0].title);
});

test("a valid blog can be added", async () => {
  const newBlog = {
    title: "React blog",
    author: "Rajesh",
    url: "/react-blog",
    likes: 7,
  };

  await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const response = await helper.blogsInDb();

  const titles = response.map((r) => r.title);

  expect(titles).toHaveLength(helper.initialBlogs.length + 1);
  expect(titles).toContain(newBlog.title);
});

test("blog without title cannot be saved", async () => {
  const newBlog = {
    author: "Rajesh",
    url: "/react-blog",
    likes: 7,
  };

  await api.post("/api/blogs").send(newBlog).expect(422);

  const blogs = await helper.blogsInDb();
  expect(blogs).toHaveLength(helper.initialBlogs.length);
});

afterAll(() => {
  mongoose.connection.close();
});

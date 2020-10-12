const Blog = require("../models/blog");

const initialBlogs = [
  {
    title: "Hello world!",
    author: "Sridevi",
    url: "/hello-world",
    likes: 4,
  },
  {
    title: "Node is awesome",
    author: "Rakesh",
    url: "/node-is-awesome",
    likes: 3,
  },
];

const nonExistingId = async () => {
  const blog = new Blog({
    title: "This blog will be removed soon!",
    author: "Unknown",
    url: "/removed-blog",
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

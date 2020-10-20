const blogsRouter = require('express').Router();
const Blog = require('../models/blog');

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({});
  return response.json(blogs);
});

blogsRouter.get('/:blogId', async (request, response) => {
  const blog = await Blog.findById(request.params.blogId);
  if (blog) {
    return response.json(blog);
  }
  return response.status(404).end();
});

blogsRouter.post('/', async (request, response) => {
  const blog = new Blog({ ...request.body, ...{ likes: request.body.likes || 0 } });
  const savedBlog = await blog.save();
  response.status(201).json(savedBlog);
});

blogsRouter.put('/:blogId', async (req, res) => {
  const blog = await Blog.findById(req.params.blogId);
  console.log('blog : ', blog);
  blog.likes = req.body.likes || 0;
  const updatedBlog = await blog.update();
  console.log('updatedBlog : ', updatedBlog);
  res.status(200).json(updatedBlog);
});

blogsRouter.delete('/:blogId', async (request, response) => {
  await Blog.findByIdAndDelete(request.params.blogId).then((blogs) => {
    response.json(blogs);
  });
});

module.exports = blogsRouter;

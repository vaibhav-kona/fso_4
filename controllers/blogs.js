const blogsRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const Blog = require('../models/blog');
const User = require('../models/user');

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { blogs: 0 });
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
  const { token } = request;
  if (!token) {
    response.status(401).json({ error: 'token missing or invalid' });
  }

  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!decodedToken.id) {
    response.status(401).json({ error: 'token missing or invalid' });
  }

  const user = await User.findById(decodedToken.id);

  const blog = new Blog({
    ...request.body,
    ...{
      likes: request.body.likes || 0,
      // eslint-disable-next-line no-underscore-dangle
      user: user._id,
    },
  });
  const savedBlog = await blog.save();
  // eslint-disable-next-line no-underscore-dangle
  user.blogs = user.blogs.concat(savedBlog._id);

  await user.save();
  response.status(201).json(savedBlog);
});

blogsRouter.put('/:blogId', async (req, res) => {
  const updatedBlog = await Blog.findByIdAndUpdate(
    req.params.blogId, { likes: (req.body.likes || 0) }, { new: true },
  );
  res.status(200).json(updatedBlog);
});

blogsRouter.delete('/:blogId', async (request, response, next) => {
  try {
    const { token } = request;

    if (!token) {
      response.status(401).json({ error: 'token missing or invalid' });
    }

    const decodedToken = jwt.verify(token, process.env.SECRET);
    if (!decodedToken.id) {
      response.status(401).json({ error: 'token missing or invalid' });
    }

    const blogToBDeleted = await Blog.findById(request.params.blogId);
    const blogAuthorId = blogToBDeleted.user && blogToBDeleted.user.toString();

    if (decodedToken.id !== blogAuthorId) {
      response.status(403).json({ error: 'not authorized to delete the blog' });
    } else {
      await Blog.findByIdAndDelete(request.params.blogId).then((blogs) => {
        response.json(blogs);
      });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = blogsRouter;

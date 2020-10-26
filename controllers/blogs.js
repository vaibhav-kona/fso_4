const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { request } = require('express');

const getTokenFrom = req => {
  const auth = req.get('authorization');
  if(auth && auth.toLowerCase().startsWith('bearer ')){
    return auth.substring(7);
  }
  return null;
}

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
  const token = getTokenFrom(request);
  if(!token){
    return response.status(401).json({error: 'token missing or invalid'});
  }

  const decodedToken = jwt.verify(token, process.env.SECRET);
  if(!decodedToken.id){
    return response.status(401).json({error: 'token missing or invalid'});
  }

  const user = await User.findById(request.body.userId);

  const blog = new Blog({
    ...request.body,
    ...{
      likes: request.body.likes || 0,
      user: user._id,
    },
  });
  const savedBlog = await blog.save();
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

blogsRouter.delete('/:blogId', async (request, response) => {
  await Blog.findByIdAndDelete(request.params.blogId).then((blogs) => {
    response.json(blogs);
  });
});

module.exports = blogsRouter;

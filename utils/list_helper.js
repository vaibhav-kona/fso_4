const dummy = () => 1;

const totalLikes = (blogs) => {
  const getCumulativeLikeCount = (likeCountSoFar, blog) => blog.likes + likeCountSoFar;
  return blogs.reduce(getCumulativeLikeCount, 0);
};

const favoriteBlog = (blogs) => {
  const getFavoriteBlog = (currentFavoriteBlog, currentBlog) => {
    if (currentFavoriteBlog) {
      const currentFavoriteBlogLikes = currentFavoriteBlog.likes;
      const currentBlogLikes = currentBlog.likes;
      const currentBlogHasMoreLikes = currentBlogLikes > currentFavoriteBlogLikes;
      return currentBlogHasMoreLikes ? currentBlog : currentFavoriteBlog;
    }
    return currentBlog;
  };
  return blogs.reduce(getFavoriteBlog, null);
};

const mostBlogs = (blogs) => {
  const blogCountForAuthor = {};
  blogs.forEach((blog) => {
    const currentBlogCount = blogCountForAuthor[blog.author];
    const updatedBlogCount = currentBlogCount ? currentBlogCount + 1 : 1;
    blogCountForAuthor[blog.author] = updatedBlogCount;
  });

  const mostBlogsData = {
    author: '',
    blogs: 0,
  };
  // Get one of the authors with most blogs
  Object.keys(blogCountForAuthor).forEach((author) => {
    if (blogCountForAuthor[author] > mostBlogsData.blogs) {
      mostBlogsData.author = author;
      mostBlogsData.blogs = blogCountForAuthor[author];
    }
  });

  return mostBlogsData;
};

const mostLikes = (blogs) => {
  const blogLikesForAuthor = {};
  blogs.forEach((blog) => {
    const currentBlogCount = blogLikesForAuthor[blog.author];
    const updatedBlogCount = currentBlogCount ? currentBlogCount + blog.likes : blog.likes;
    blogLikesForAuthor[blog.author] = updatedBlogCount;
  });

  const mostLikedAuthor = {
    author: '',
    likes: 0,
  };
  Object.keys(blogLikesForAuthor).forEach((author) => {
    if (blogLikesForAuthor[author] > mostLikedAuthor.likes) {
      mostLikedAuthor.author = author;
      mostLikedAuthor.likes = blogLikesForAuthor[author];
    }
  });

  return mostLikedAuthor;
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};

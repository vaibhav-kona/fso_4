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

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
};

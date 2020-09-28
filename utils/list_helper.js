const dummy = () => 1;

const totalLikes = (blogs) => {
  const getCumulativeLikeCount = (likeCountSoFar, blog) => blog.likes + likeCountSoFar;
  return blogs.reduce(getCumulativeLikeCount, 0);
};

module.exports = {
  dummy,
  totalLikes,
};

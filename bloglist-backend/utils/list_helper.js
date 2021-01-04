const dummy = (blogs) => 1;

const totalLikes = (blogs) => {
  if (blogs.length > 1) {
    return blogs.reduce((sum, blog) => sum + blog.likes, 0);
  }

  if (blogs.length === 1) {
    return blogs[0].likes;
  }

  if (blogs.length === 0) {
    return 0;
  }

  return undefined;
};

module.exports = {
  dummy,
  totalLikes,
};
